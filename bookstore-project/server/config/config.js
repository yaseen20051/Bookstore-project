// server/config/config.js
require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3002,
        env: process.env.NODE_ENV || 'development'
    },
    
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'bookstore_db',
        port: process.env.DB_PORT || 3306
    },
    
    security: {
        sessionSecret: process.env.SESSION_SECRET || 'default_session_secret_change_this',
        jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_this',
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT_HOURS || '24') * 60 * 60 * 1000,
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        loginTimeoutMinutes: parseInt(process.env.LOGIN_TIMEOUT_MINUTES || '15')
    },
    
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    }
};