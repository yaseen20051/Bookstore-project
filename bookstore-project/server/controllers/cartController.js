// server/controllers/cartController.js
const db = require('../../database/connection');
const { validateCartItem } = require('../middleware/validation');

// Get active cart
exports.getCart = async (req, res) => {
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
            SELECT ci.*, b.title, b.price, b.quantity_in_stock,
                   (ci.quantity * b.price) as subtotal
            FROM Cart_Items ci
            JOIN Books b ON ci.ISBN = b.ISBN
            WHERE ci.cart_id = ?
        `, [cartId]);
        
        const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        res.json({ 
            cart_id: cartId, 
            items, 
            total: total.toFixed(2),
            item_count: items.length
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// Add item to cart
exports.addItem = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const { isbn, quantity } = req.body;
        
        // Check if book exists and has enough stock
        const [books] = await db.query(
            'SELECT ISBN, title, quantity_in_stock FROM Books WHERE ISBN = ?',
            [isbn]
        );
        
        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const book = books[0];
        
        // Get active cart
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
        
        // Check if item already in cart
        const [existing] = await db.query(
            'SELECT quantity FROM Cart_Items WHERE cart_id = ? AND ISBN = ?',
            [cartId, isbn]
        );
        
        const newQuantity = existing.length > 0 ? existing[0].quantity + quantity : quantity;
        
        // Check stock availability
        if (newQuantity > book.quantity_in_stock) {
            return res.status(400).json({ 
                error: `Only ${book.quantity_in_stock} copies available in stock` 
            });
        }
        
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
        
        res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

// Update cart item quantity
exports.updateItem = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const { isbn } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }
        
        // Check stock
        const [books] = await db.query(
            'SELECT quantity_in_stock FROM Books WHERE ISBN = ?',
            [isbn]
        );
        
        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        if (quantity > books[0].quantity_in_stock) {
            return res.status(400).json({ 
                error: `Only ${books[0].quantity_in_stock} copies available` 
            });
        }
        
        const [carts] = await db.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        if (carts.length === 0) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        const [result] = await db.query(
            'UPDATE Cart_Items SET quantity = ? WHERE cart_id = ? AND ISBN = ?',
            [quantity, carts[0].cart_id, isbn]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not in cart' });
        }
        
        res.json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        const { isbn } = req.params;
        
        const [carts] = await db.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        if (carts.length === 0) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        const [result] = await db.query(
            'DELETE FROM Cart_Items WHERE cart_id = ? AND ISBN = ?',
            [carts[0].cart_id, isbn]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not in cart' });
        }
        
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const customerId = req.session.user.id;
        
        const [carts] = await db.query(
            'SELECT cart_id FROM Shopping_Carts WHERE customer_id = ? AND is_active = TRUE',
            [customerId]
        );
        
        if (carts.length > 0) {
            await db.query('DELETE FROM Cart_Items WHERE cart_id = ?', [carts[0].cart_id]);
        }
        
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

// Checkout
exports.checkout = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const customerId = req.session.user.id;
        const { credit_card_number, card_expiry } = req.body;
        
        // Basic credit card validation
        if (!credit_card_number || credit_card_number.length < 13) {
            throw new Error('Invalid credit card number');
        }
        
        if (!card_expiry || !/^\d{2}\/\d{4}$/.test(card_expiry)) {
            throw new Error('Invalid card expiry format (MM/YYYY)');
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
        
        // Get cart items with current prices
        const [items] = await connection.query(`
            SELECT ci.*, b.price, b.quantity_in_stock, b.title
            FROM Cart_Items ci
            JOIN Books b ON ci.ISBN = b.ISBN
            WHERE ci.cart_id = ?
        `, [cartId]);
        
        if (items.length === 0) {
            throw new Error('Cart is empty');
        }
        
        // Verify stock availability for all items
        for (const item of items) {
            if (item.quantity > item.quantity_in_stock) {
                throw new Error(`Insufficient stock for "${item.title}". Only ${item.quantity_in_stock} available.`);
            }
        }
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price)), 0);
        
        // Create sale
        const [saleResult] = await connection.query(
            'INSERT INTO Sales (customer_id, total_amount, credit_card_last4, card_expiry) VALUES (?, ?, ?, ?)',
            [customerId, total.toFixed(2), credit_card_number.slice(-4), card_expiry]
        );
        
        const saleId = saleResult.insertId;
        
        // Insert sale items and update stock
        for (const item of items) {
            // Insert sale item
            await connection.query(
                'INSERT INTO Sale_Items (sale_id, ISBN, quantity, price_at_sale) VALUES (?, ?, ?, ?)',
                [saleId, item.ISBN, item.quantity, item.price]
            );
            
            // Update book stock (this may trigger auto-reorder)
            await connection.query(
                'UPDATE Books SET quantity_in_stock = quantity_in_stock - ? WHERE ISBN = ?',
                [item.quantity, item.ISBN]
            );
        }
        
        // Clear cart
        await connection.query('DELETE FROM Cart_Items WHERE cart_id = ?', [cartId]);
        
        await connection.commit();
        
        res.json({ 
            message: 'Checkout successful', 
            sale_id: saleId,
            total: total.toFixed(2)
        });
    } catch (error) {
        await connection.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};