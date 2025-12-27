// server/controllers/adminController.js
const db = require('../../database/connection');
const { validateBookData, validateAuthors, validateOrderData, validatePublisherData } = require('../middleware/validation');
const ApiResponse = require('../utils/responseFormatter');
const { AppError } = require('../middleware/errorHandler');

// Add new book
exports.addBook = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { 
            isbn, title, publisher_id, publication_year, 
            price, category, quantity_in_stock, threshold_quantity, 
            authors 
        } = req.body;
        
        // Check if book already exists
        const [existing] = await connection.query('SELECT ISBN FROM Books WHERE ISBN = ?', [isbn]);
        if (existing.length > 0) {
            throw new Error('Book with this ISBN already exists');
        }
        
        // Insert book
        await connection.query(
            'INSERT INTO Books (ISBN, title, publisher_id, publication_year, price, category, quantity_in_stock, threshold_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [isbn, title, publisher_id, publication_year, price, category, quantity_in_stock || 0, threshold_quantity || 10]
        );
        
        // Insert authors
        if (authors && authors.length > 0) {
            for (const authorName of authors) {
                const trimmedName = authorName.trim();
                if (!trimmedName) continue;
                
                // Check if author exists
                let [existingAuthor] = await connection.query(
                    'SELECT author_id FROM Authors WHERE author_name = ?', 
                    [trimmedName]
                );
                
                let authorId;
                if (existingAuthor.length === 0) {
                    // Create new author
                    const [result] = await connection.query(
                        'INSERT INTO Authors (author_name) VALUES (?)', 
                        [trimmedName]
                    );
                    authorId = result.insertId;
                } else {
                    authorId = existingAuthor[0].author_id;
                }
                
                // Link book to author
                await connection.query(
                    'INSERT INTO Book_Authors (ISBN, author_id) VALUES (?, ?)', 
                    [isbn, authorId]
                );
            }
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Book added successfully', isbn });
    } catch (error) {
        await connection.rollback();
        console.error('Add book error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const { isbn } = req.params;
        const { 
            title, publisher_id, publication_year, 
            price, category, quantity_in_stock, threshold_quantity 
        } = req.body;
        
        const [result] = await db.query(
            `UPDATE Books 
             SET title = ?, publisher_id = ?, publication_year = ?, 
                 price = ?, category = ?, quantity_in_stock = ?, threshold_quantity = ? 
             WHERE ISBN = ?`,
            [title, publisher_id, publication_year, price, category, quantity_in_stock, threshold_quantity, isbn]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const { isbn } = req.params;
        
        const [result] = await db.query('DELETE FROM Books WHERE ISBN = ?', [isbn]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all publisher orders
exports.getPublisherOrders = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT po.*, b.title, p.name as publisher_name
            FROM Publisher_Orders po
            JOIN Books b ON po.ISBN = b.ISBN
            JOIN Publishers p ON po.publisher_id = p.publisher_id
        `;
        
        const params = [];
        
        if (status) {
            query += ' WHERE po.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY po.order_date DESC';
        
        const [orders] = await db.query(query, params);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Confirm publisher order
exports.confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Update order status (trigger will automatically update stock)
        const [result] = await db.query(
            "UPDATE Publisher_Orders SET status = 'Confirmed' WHERE order_id = ? AND status = 'Pending'",
            [orderId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found or already confirmed' });
        }
        
        res.json({ message: 'Order confirmed successfully' });
    } catch (error) {
        console.error('Confirm order error:', error);
        res.status(500).json({ error: 'Failed to confirm order' });
    }
};

// =====================================================
// REPORTS
// =====================================================

// Report: Total sales for previous month
exports.getSalesPreviousMonth = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT 
                SUM(total_amount) as total_sales, 
                COUNT(*) as num_orders,
                DATE_FORMAT(MIN(sale_date), '%Y-%m') as month
            FROM Sales
            WHERE YEAR(sale_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
              AND MONTH(sale_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
        `);
        
        res.json(result[0]);
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// Report: Total sales for specific date
exports.getSalesByDate = async (req, res) => {
    try {
        const { date } = req.params;
        
        const [result] = await db.query(`
            SELECT 
                SUM(total_amount) as total_sales, 
                COUNT(*) as num_orders,
                DATE(sale_date) as date
            FROM Sales
            WHERE DATE(sale_date) = ?
        `, [date]);
        
        res.json(result[0]);
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// Report: Top 5 customers (last 3 months)
exports.getTopCustomers = async (req, res) => {
    try {
        const [customers] = await db.query(`
            SELECT 
                c.customer_id, 
                c.first_name, 
                c.last_name, 
                c.email,
                SUM(s.total_amount) as total_spent,
                COUNT(s.sale_id) as num_orders
            FROM Customers c
            JOIN Sales s ON c.customer_id = s.customer_id
            WHERE s.sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY c.customer_id, c.first_name, c.last_name, c.email
            ORDER BY total_spent DESC
            LIMIT 5
        `);
        
        res.json(customers);
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// Report: Top 10 selling books (last 3 months)
exports.getTopBooks = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT 
                b.ISBN, 
                b.title,
                b.category,
                SUM(si.quantity) as total_sold,
                SUM(si.quantity * si.price_at_sale) as total_revenue
            FROM Books b
            JOIN Sale_Items si ON b.ISBN = si.ISBN
            JOIN Sales s ON si.sale_id = s.sale_id
            WHERE s.sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY b.ISBN, b.title, b.category
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        
        res.json(books);
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// Report: Total times a book has been ordered (replenishment)
exports.getBookOrderCount = async (req, res) => {
    try {
        const { isbn } = req.params;
        
        const [result] = await db.query(`
            SELECT 
                b.ISBN,
                b.title,
                COUNT(po.order_id) as order_count, 
                SUM(po.quantity) as total_quantity_ordered,
                SUM(CASE WHEN po.status = 'Confirmed' THEN po.quantity ELSE 0 END) as confirmed_quantity
            FROM Books b
            LEFT JOIN Publisher_Orders po ON b.ISBN = po.ISBN
            WHERE b.ISBN = ?
            GROUP BY b.ISBN, b.title
        `, [isbn]);
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(result[0]);
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// Dashboard summary with enhanced stats
exports.getDashboardSummary = async (req, res) => {
    try {
        // Total books (excluding soft deleted)
        const [bookCount] = await db.query('SELECT COUNT(*) as count FROM Books WHERE is_deleted = FALSE');
        
        // Total customers
        const [customerCount] = await db.query('SELECT COUNT(*) as count FROM Customers');
        
        // Pending orders
        const [pendingOrders] = await db.query("SELECT COUNT(*) as count FROM Publisher_Orders WHERE status = 'Pending'");
        
        // Today's sales
        const [todaySales] = await db.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
            FROM Sales 
            WHERE DATE(sale_date) = CURRENT_DATE
        `);
        
        // This week's sales
        const [weekSales] = await db.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
            FROM Sales 
            WHERE sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
        `);
        
        // This month's sales
        const [monthSales] = await db.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
            FROM Sales 
            WHERE YEAR(sale_date) = YEAR(CURRENT_DATE) 
            AND MONTH(sale_date) = MONTH(CURRENT_DATE)
        `);
        
        // Low stock books (below threshold)
        const [lowStock] = await db.query(`
            SELECT COUNT(*) as count 
            FROM Books 
            WHERE quantity_in_stock < threshold_quantity AND is_deleted = FALSE
        `);
        
        // Recent sales activity
        const [recentSales] = await db.query(`
            SELECT s.sale_id, s.sale_date, s.total_amount, 
                   c.first_name, c.last_name, c.email
            FROM Sales s
            JOIN Customers c ON s.customer_id = c.customer_id
            ORDER BY s.sale_date DESC
            LIMIT 5
        `);
        
        res.json(ApiResponse.success({
            stats: {
                total_books: bookCount[0].count,
                total_customers: customerCount[0].count,
                pending_orders: pendingOrders[0].count,
                low_stock_books: lowStock[0].count
            },
            sales: {
                today: {
                    count: todaySales[0].count,
                    amount: parseFloat(todaySales[0].total)
                },
                week: {
                    count: weekSales[0].count,
                    amount: parseFloat(weekSales[0].total)
                },
                month: {
                    count: monthSales[0].count,
                    amount: parseFloat(monthSales[0].total)
                }
            },
            recent_sales: recentSales
        }));
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

// Get low stock books
exports.getLowStockBooks = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.ISBN, b.title, b.quantity_in_stock, b.threshold_quantity,
                   p.name as publisher_name
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            WHERE b.quantity_in_stock < b.threshold_quantity 
            AND b.is_deleted = FALSE
            ORDER BY (b.threshold_quantity - b.quantity_in_stock) DESC
            LIMIT 20
        `);
        
        res.json(ApiResponse.success(books));
    } catch (error) {
        console.error('Low stock error:', error);
        res.status(500).json({ error: 'Failed to fetch low stock books' });
    }
};