// server/controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../../database/connection');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Register new customer
exports.register = async (req, res) => {
    try {
        const { username, password, first_name, last_name, email, phone, shipping_address } = req.body;
        
        // Check if username exists
        const [existing] = await db.query('SELECT * FROM Customers WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Check if email exists
        const [existingEmail] = await db.query('SELECT * FROM Customers WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
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
        
        res.status(201).json({ 
            message: 'Registration successful', 
            customer_id: result.insertId 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password, user_type } = req.body;
        
        // Admin login with database authentication
        if (user_type === 'admin') {
            const [admins] = await db.query(
                'SELECT * FROM Admins WHERE username = ? AND is_active = TRUE', 
                [username]
            );
            
            if (admins.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            const admin = admins[0];
            const validPassword = await bcrypt.compare(password, admin.password_hash);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            // Update last login
            await db.query(
                'UPDATE Admins SET last_login = CURRENT_TIMESTAMP WHERE admin_id = ?',
                [admin.admin_id]
            );
            
            req.session.user = { 
                id: admin.admin_id, 
                username: admin.username,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                type: 'admin' 
            };
            
            return res.json({ 
                success: true, 
                user_type: 'admin',
                message: 'Admin login successful',
                user: {
                    id: admin.admin_id,
                    username: admin.username,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                    email: admin.email
                }
            });
        }
        
        // Customer login
        const [customers] = await db.query(
            'SELECT * FROM Customers WHERE username = ?', 
            [username]
        );
        
        if (customers.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const customer = customers[0];
        const validPassword = await bcrypt.compare(password, customer.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Set session
        req.session.user = {
            id: customer.customer_id,
            username: customer.username,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            type: 'customer'
        };
        
        res.json({ 
            success: true, 
            user_type: 'customer',
            customer: {
                id: customer.customer_id,
                username: customer.username,
                first_name: customer.first_name,
                last_name: customer.last_name,
                email: customer.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
};

// Logout
exports.logout = async (req, res) => {
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
        
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed: ' + error.message });
    }
};

// Check session status
exports.checkAuth = (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
};