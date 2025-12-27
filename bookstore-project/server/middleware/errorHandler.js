// server/middleware/errorHandler.js
const ApiResponse = require('../utils/responseFormatter');

/**
 * Custom error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });
    
    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        const field = err.message.match(/for key '(\w+)'/)?.[1];
        error = new AppError(
            `Duplicate entry for ${field}`,
            409,
            'DUPLICATE_ENTRY'
        );
    }
    
    // MySQL foreign key constraint error
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        error = new AppError(
            'Referenced record does not exist',
            400,
            'INVALID_REFERENCE'
        );
    }
    
    // Validation error
    if (err.name === 'ValidationError') {
        error = new AppError(
            'Validation failed',
            400,
            'VALIDATION_ERROR',
            err.details
        );
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError(
            'Invalid token',
            401,
            'INVALID_TOKEN'
        );
    }
    
    if (err.name === 'TokenExpiredError') {
        error = new AppError(
            'Token expired',
            401,
            'TOKEN_EXPIRED'
        );
    }
    
    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const response = ApiResponse.error(
        error.message || 'Internal server error',
        error.code || 'ERROR',
        error.details
    );
    
    res.status(statusCode).json(response);
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, asyncHandler };