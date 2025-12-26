// server/routes/cart.js
const express = require('express');
const router = express.Router();
const db = require('../../database/connection');

// Middleware to check customer authentication
const isCustomer = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'customer') {
        return res.status(403).json({ error: 'Customer login required' });
    }
    next();
};

router.use(isCustomer);

// Get active cart
router.get('/', async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        // Get or create active cart
        let [carts] = await db.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        let cartId;
        if (carts.length === 0) {
            const [result] = await db.query(
                'INSERT INTO Shopping_Carts (customer_id, is_active) VALUES (?, TRUE)',
                [customerId]
            );
            cartId = result.insertId;
        } else {
            cartId = carts[0].cart_id;
        }
        
        // Get cart items
        const [items] = await db.query(`
            SELECT ci.*, b.title, b.price, (ci.quantity * b.price) as subtotal
            FROM Cart_Items ci
            JOIN Books b ON ci.ISBN = b.ISBN
            WHERE ci.cart_id = ?
        `, [cartId]);
        
        const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        res.json({ cart_id: cartId, items, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/items', async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const { isbn, quantity } = req.body;
        
        // Get active cart
        const [carts] = await db.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        const cartId = carts[0].cart_id;
        
        // Check if item already in cart
        const [existing] = await db.query(
            'SELECT * FROM Cart_Items WHERE cart_id = ? AND ISBN = ?',
            [cartId, isbn]
        );
        
        if (existing.length > 0) {
            // Update quantity
            await db.query(
                'UPDATE Cart_Items SET quantity = quantity + ? WHERE cart_id = ? AND ISBN = ?',
                [quantity, cartId, isbn]
            );
        } else {
            // Insert new item
            await db.query(
                'INSERT INTO Cart_Items (cart_id, ISBN, quantity) VALUES (?, ?, ?)',
                [cartId, isbn, quantity]
            );
        }
        
        res.json({ message: 'Item added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Remove item from cart
router.delete('/items/:isbn', async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        const [carts] = await db.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        await db.query(
            'DELETE FROM Cart_Items WHERE cart_id = ? AND ISBN = ?',
            [carts[0].cart_id, req.params.isbn]
        );
        
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// Checkout
router.post('/checkout', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const customerId = req.session.user.id;
        const { credit_card_number, card_expiry } = req.body;
        
        // Basic credit card validation (you can enhance this)
        if (!credit_card_number || credit_card_number.length < 13) {
            throw new Error('Invalid credit card');
        }
        
        // Get active cart
        const [carts] = await connection.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        if (carts.length === 0) {
            throw new Error('No active cart found');
        }
        
        const cartId = carts[0].cart_id;
        
        // Get cart items
        const [items] = await connection.query(`
            SELECT ci.*, b.price
            FROM Cart_Items ci
            JOIN Books b ON ci.ISBN = b.ISBN
            WHERE ci.cart_id = ?
        `, [cartId]);
        
        if (items.length === 0) {
            throw new Error('Cart is empty');
        }
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price)), 0);
        
        // Create sale
        const [saleResult] = await connection.query(
            'INSERT INTO Sales (customer_id, total_amount, credit_card_last4, card_expiry) VALUES (?, ?, ?, ?)',
            [customerId, total, credit_card_number.slice(-4), card_expiry]
        );
        
        const saleId = saleResult.insertId;
        
        // Insert sale items and update stock
        for (const item of items) {
            // Insert sale item
            await connection.query(
                'INSERT INTO Sale_Items (sale_id, ISBN, quantity, price_at_sale) VALUES (?, ?, ?, ?)',
                [saleId, item.ISBN, item.quantity, item.price]
            );
            
            // Update book stock
            await connection.query(
                'UPDATE Books SET quantity_in_stock = quantity_in_stock - ? WHERE ISBN = ?',
                [item.quantity, item.ISBN]
            );
        }
        
        // Clear cart
        await connection.query('DELETE FROM Cart_Items WHERE cart_id = ?', [cartId]);
        
        await connection.commit();
        res.json({ message: 'Checkout successful', sale_id: saleId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;