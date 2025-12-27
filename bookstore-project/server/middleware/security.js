// server/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('../config');

/**
 * Security headers using helmet
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://cdn.jsdelivr.net"], // unsafe-hashes allows inline event handlers
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers like onclick="..."
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net"], // Allow CDN connections for source maps
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
});

/**
 * Rate limiter for authentication routes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Input sanitization
 */
const sanitizeInput = (req, res, next) => {
    // Sanitize req.body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Remove potential XSS attacks
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .trim();
            }
        });
    }
    
    next();
};

module.exports = {
    securityHeaders,
    authLimiter,
    apiLimiter,
    sanitizeInput
};