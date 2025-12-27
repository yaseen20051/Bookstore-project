// server/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateBookData, validateAuthors, validateOrderData } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// Middleware to check admin authentication
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.use(isAdmin);

// Add new book
router.post('/books', validateBookData, validateAuthors, adminController.addBook);

// Update book
router.put('/books/:isbn', validateBookData, adminController.updateBook);

// Delete book
router.delete('/books/:isbn', adminController.deleteBook);

// Confirm publisher order
router.put('/orders/:orderId/confirm', adminController.confirmOrder);

// Get all publisher orders
router.get('/orders', adminController.getPublisherOrders);

// Get pending orders
router.get('/orders/pending', (req, res) => {
    req.query.status = 'Pending';
    adminController.getPublisherOrders(req, res);
});

// Reports
router.get('/reports/sales/previous-month', adminController.getSalesPreviousMonth);
router.get('/reports/sales/date/:date', adminController.getSalesByDate);
router.get('/reports/customers/top5', adminController.getTopCustomers);
router.get('/reports/books/top10', adminController.getTopBooks);
router.get('/reports/books/:isbn/order-count', adminController.getBookOrderCount);

// Dashboard
router.get('/dashboard', adminController.getDashboardSummary);
router.get('/dashboard/low-stock', adminController.getLowStockBooks);

// Individual stats
router.get('/stats/customers', async (req, res) => {
    try {
        const [result] = await req.app.locals.db.query('SELECT COUNT(*) as count FROM Customers');
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer stats' });
    }
});

router.get('/stats/books', async (req, res) => {
    try {
        const [result] = await req.app.locals.db.query('SELECT COUNT(*) as count FROM Books WHERE is_deleted = FALSE');
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book stats' });
    }
});

router.get('/stats/pending-orders', async (req, res) => {
    try {
        const [result] = await req.app.locals.db.query("SELECT COUNT(*) as count FROM Publisher_Orders WHERE status = 'Pending'");
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending order stats' });
    }
});

module.exports = router;
