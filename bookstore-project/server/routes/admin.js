// server/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../../database/connection');

// Middleware to check admin authentication
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.use(isAdmin);

// Add new book
router.post('/books', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { isbn, title, publisher_id, publication_year, price, category, 
                quantity_in_stock, threshold_quantity, authors } = req.body;
        
        // Insert book
        await connection.query(
            'INSERT INTO Books (ISBN, title, publisher_id, publication_year, price, category, quantity_in_stock, threshold_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [isbn, title, publisher_id, publication_year, price, category, quantity_in_stock, threshold_quantity]
        );
        
        // Insert authors (authors is array of author names)
        for (const authorName of authors) {
            // Check if author exists
            let [existing] = await connection.query('SELECT author_id FROM Authors WHERE author_name = ?', [authorName]);
            
            let authorId;
            if (existing.length === 0) {
                // Create new author
                const [result] = await connection.query('INSERT INTO Authors (author_name) VALUES (?)', [authorName]);
                authorId = result.insertId;
            } else {
                authorId = existing[0].author_id;
            }
            
            // Link book to author
            await connection.query('INSERT INTO Book_Authors (ISBN, author_id) VALUES (?, ?)', [isbn, authorId]);
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to add book' });
    } finally {
        connection.release();
    }
});

// Update book
router.put('/books/:isbn', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { title, publisher_id, publication_year, price, category, 
                quantity_in_stock, threshold_quantity } = req.body;
        
        await connection.query(
            'UPDATE Books SET title = ?, publisher_id = ?, publication_year = ?, price = ?, category = ?, quantity_in_stock = ?, threshold_quantity = ? WHERE ISBN = ?',
            [title, publisher_id, publication_year, price, category, quantity_in_stock, threshold_quantity, req.params.isbn]
        );
        
        await connection.commit();
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// Delete book
router.delete('/books/:isbn', async (req, res) => {
    try {
        await db.query('DELETE FROM Books WHERE ISBN = ?', [req.params.isbn]);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Confirm publisher order
router.put('/orders/:orderId/confirm', async (req, res) => {
    try {
        await db.query(
            "UPDATE Publisher_Orders SET status = 'Confirmed' WHERE order_id = ?",
            [req.params.orderId]
        );
        
        res.json({ message: 'Order confirmed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

// Get pending orders
router.get('/orders/pending', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT po.*, b.title, p.name as publisher_name
            FROM Publisher_Orders po
            JOIN Books b ON po.ISBN = b.ISBN
            JOIN Publishers p ON po.publisher_id = p.publisher_id
            WHERE po.status = 'Pending'
            ORDER BY po.order_date DESC
        `);
        
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Report: Total sales for previous month
router.get('/reports/sales/previous-month', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT SUM(total_amount) as total_sales, COUNT(*) as num_orders
            FROM Sales
            WHERE YEAR(sale_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
              AND MONTH(sale_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
        `);
        
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Report: Total sales for specific date
router.get('/reports/sales/date/:date', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT SUM(total_amount) as total_sales, COUNT(*) as num_orders
            FROM Sales
            WHERE DATE(sale_date) = ?
        `, [req.params.date]);
        
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Report: Top 5 customers (last 3 months)
router.get('/reports/customers/top5', async (req, res) => {
    try {
        const [customers] = await db.query(`
            SELECT c.customer_id, c.first_name, c.last_name, 
                   SUM(s.total_amount) as total_spent,
                   COUNT(s.sale_id) as num_orders
            FROM Customers c
            JOIN Sales s ON c.customer_id = s.customer_id
            WHERE s.sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY c.customer_id, c.first_name, c.last_name
            ORDER BY total_spent DESC
            LIMIT 5
        `);
        
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Report: Top 10 selling books (last 3 months)
router.get('/reports/books/top10', async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.ISBN, b.title, 
                   SUM(si.quantity) as total_sold,
                   SUM(si.quantity * si.price_at_sale) as total_revenue
            FROM Books b
            JOIN Sale_Items si ON b.ISBN = si.ISBN
            JOIN Sales s ON si.sale_id = s.sale_id
            WHERE s.sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY b.ISBN, b.title
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Report: Total times a book has been ordered (replenishment)
router.get('/reports/books/:isbn/order-count', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT COUNT(*) as order_count, SUM(quantity) as total_quantity
            FROM Publisher_Orders
            WHERE ISBN = ?
        `, [req.params.isbn]);
        
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Dashboard Stats
router.get('/stats/customers', async (req, res) => {
    try {
        const [result] = await db.query('SELECT COUNT(*) as count FROM Customers');
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer stats' });
    }
});

router.get('/stats/books', async (req, res) => {
    try {
        const [result] = await db.query('SELECT COUNT(*) as count FROM Books');
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book stats' });
    }
});

router.get('/stats/pending-orders', async (req, res) => {
    try {
        const [result] = await db.query("SELECT COUNT(*) as count FROM Publisher_Orders WHERE status = 'Pending'");
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending order stats' });
    }
});

module.exports = router;