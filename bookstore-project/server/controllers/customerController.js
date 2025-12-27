// server/controllers/customerController.js
const bcrypt = require('bcrypt');
const db = require('../../database/connection');

// Get customer profile
exports.getProfile = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        const [customers] = await db.query(
            'SELECT customer_id, username, first_name, last_name, email, phone, shipping_address FROM Customers WHERE customer_id = ?',
            [customerId]
        );
        
        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(customers[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update customer profile
exports.updateProfile = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const { first_name, last_name, email, phone, shipping_address, current_password, new_password } = req.body;
        
        // If changing password, verify current password
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ error: 'Current password is required to change password' });
            }
            
            const [customers] = await db.query(
                'SELECT password_hash FROM Customers WHERE customer_id = ?',
                [customerId]
            );
            
            const validPassword = await bcrypt.compare(current_password, customers[0].password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            // Hash new password
            const password_hash = await bcrypt.hash(new_password, 10);
            
            await db.query(
                'UPDATE Customers SET password_hash = ? WHERE customer_id = ?',
                [password_hash, customerId]
            );
        }
        
        // Update other fields
        await db.query(
            'UPDATE Customers SET first_name = ?, last_name = ?, email = ?, phone = ?, shipping_address = ? WHERE customer_id = ?',
            [first_name, last_name, email, phone, shipping_address, customerId]
        );
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get customer orders
exports.getOrders = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        const [orders] = await db.query(`
            SELECT 
                s.sale_id,
                s.sale_date,
                s.total_amount,
                COUNT(si.ISBN) as item_count
            FROM Sales s
            LEFT JOIN Sale_Items si ON s.sale_id = si.sale_id
            WHERE s.customer_id = ?
            GROUP BY s.sale_id, s.sale_date, s.total_amount
            ORDER BY s.sale_date DESC
        `, [customerId]);
        
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const { orderId } = req.params;
        
        // Get order info
        const [orders] = await db.query(`
            SELECT s.*, c.first_name, c.last_name, c.email, c.shipping_address
            FROM Sales s
            JOIN Customers c ON s.customer_id = c.customer_id
            WHERE s.sale_id = ? AND s.customer_id = ?
        `, [orderId, customerId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get order items
        const [items] = await db.query(`
            SELECT si.*, b.title, b.category
            FROM Sale_Items si
            JOIN Books b ON si.ISBN = b.ISBN
            WHERE si.sale_id = ?
        `, [orderId]);
        
        res.json({
            order: orders[0],
            items: items
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
};