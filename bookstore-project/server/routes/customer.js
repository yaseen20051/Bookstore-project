// server/routes/customer.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../../database/connection');

// Middleware to check customer authentication
const isCustomer = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'customer') {
        return res.status(403).json({ error: 'Customer login required' });
    }
    next();
};

router.use(isCustomer);

// Get customer profile
router.get('/profile', async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const [profile] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [customerId]);
        if (profile.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(profile[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update customer profile
router.put('/profile', [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('shipping_address').notEmpty().withMessage('Shipping address is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const customerId = req.session.user.id;
        const { first_name, last_name, email, phone, shipping_address } = req.body;
        
        await db.query(
            'UPDATE Customers SET first_name = ?, last_name = ?, email = ?, phone = ?, shipping_address = ? WHERE customer_id = ?',
            [first_name, last_name, email, phone, shipping_address, customerId]
        );
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get customer's order history
router.get('/orders', async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        const [orders] = await db.query(`
            SELECT s.*,
                   (SELECT SUM(quantity) FROM Sale_Items si WHERE si.sale_id = s.sale_id) as item_count,
                   (SELECT GROUP_CONCAT(b.title SEPARATOR ', ') 
                    FROM Sale_Items si 
                    JOIN Books b ON si.ISBN = b.ISBN 
                    WHERE si.sale_id = s.sale_id) as items
            FROM Sales s
            WHERE s.customer_id = ?
            ORDER BY s.sale_date DESC
        `, [customerId]);
        
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;
