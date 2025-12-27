// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

// Register new customer
router.post('/register', authLimiter, validateRegistration, authController.register);

// Login with rate limiting
router.post('/login', authLimiter, validateLogin, authController.login);

// Logout
router.post('/logout', authController.logout);

// Check authentication status
router.get('/check', authController.checkAuth);

module.exports = router;
