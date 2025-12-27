// server/server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const { securityHeaders, apiLimiter, sanitizeInput } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = config.port;

// Security middleware
app.use(securityHeaders);
app.use(sanitizeInput);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../views')));

// Session configuration
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: config.session
}));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const cartRoutes = require('./routes/cart');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/cart', cartRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin/login.html'));
});

// Global error handler
app.use(errorHandler);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'API endpoint not found'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     📚 Bookstore Server Started           ║
╠════════════════════════════════════════════╣
║  🌐 URL: http://localhost:${PORT}${' '.repeat(Math.max(0, 18 - PORT.toString().length))} ║
║  🔧 Environment: ${config.nodeEnv.padEnd(23)} ║
║  🛡️  Security: Enabled${' '.repeat(18)} ║
╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});