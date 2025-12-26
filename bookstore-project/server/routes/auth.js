// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../database/connection');

// Register new customer
router.post('/register', async (req, res) => {
    try {
        const { username, password, first_name, last_name, email, phone, shipping_address } = req.body;
        
        // Check if username exists
        const [existing] = await db.query('SELECT * FROM Customers WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Insert customer
        const [result] = await db.query(
            'INSERT INTO Customers (username, password_hash, first_name, last_name, email, phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, password_hash, first_name, last_name, email, phone, shipping_address]
        );
        
        // Create active shopping cart
        await db.query(
            'INSERT INTO Shopping_Carts (customer_id, is_active) VALUES (?, TRUE)',
            [result.insertId]
        );
        
        res.status(201).json({ message: 'Registration successful', customer_id: result.insertId });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password, user_type } = req.body;
        
        // For admin login (hardcoded or separate admin table)
        if (user_type === 'admin') {
            if (username === 'admin' && password === 'admin123') {
                req.session.user = { id: 0, username: 'admin', type: 'admin' };
                return res.json({ success: true, user_type: 'admin' });
            }
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }
        
        // Customer login
        const [customers] = await db.query('SELECT * FROM Customers WHERE username = ?', [username]);
        
        if (customers.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const customer = customers[0];
        const validPassword = await bcrypt.compare(password, customer.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Set session
        req.session.user = {
            id: customer.customer_id,
            username: customer.username,
            type: 'customer'
        };
        
        res.json({ success: true, user_type: 'customer', customer_id: customer.customer_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        if (req.session.user && req.session.user.type === 'customer') {
            // Clear cart items on logout
            const [cart] = await db.query(
                'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
                [req.session.user.id]
            );
            
            if (cart.length > 0) {
                await db.query('DELETE FROM Cart_Items WHERE cart_id = ?', [cart[0].cart_id]);
            }
        }
        
        req.session.destroy();
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

module.exports = router;