// server/config/index.js
require('dotenv').config();

module.exports = {
    // Server
    port: process.env.PORT || 3002,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'bookstore_db',
        port: parseInt(process.env.DB_PORT) || 3306,
        connectionLimit: 10
    },
    
    // Security
    session: {
        secret: process.env.SESSION_SECRET || 'fallback_secret_change_this',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    },
    
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_jwt_secret_change_this',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    
    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
        credentials: true
    },
    
    // Pagination
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    },
    
    // Email (for future use)
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.EMAIL_FROM || 'noreply@bookstore.com'
    }
};