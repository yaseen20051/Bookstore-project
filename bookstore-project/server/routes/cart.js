// server/routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateCartItem } = require('../middleware/validation');

// Middleware to check customer authentication
const isCustomer = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'customer') {
        return res.status(403).json({ error: 'Customer login required' });
    }
    next();
};

router.use(isCustomer);

// Get active cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', validateCartItem, cartController.addItem);

// Update cart item quantity
router.put('/items/:isbn', cartController.updateItem);

// Remove item from cart
router.delete('/items/:isbn', cartController.removeItem);

// Clear cart
router.delete('/', cartController.clearCart);

// Checkout
router.post('/checkout', cartController.checkout);

module.exports = router;
