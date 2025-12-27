// server/middleware/validation.js

// =====================================================
// GENERAL VALIDATION FUNCTIONS
// =====================================================

/**
 * Check if required fields are present in the request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Middleware function
 */
const validateRequired = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        const errors = {};
        
        requiredFields.forEach(field => {
            if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
                missingFields.push(field);
                errors[field] = `${field} is required`;
            }
        });
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missing_fields: missingFields,
                details: errors
            });
        }
        
        next();
    };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate ISBN format (VARCHAR(20))
 * @param {string} isbn - ISBN to validate
 * @returns {boolean} True if valid ISBN format
 */
const validateISBN = (isbn) => {
    // ISBN can be 10 or 13 digits, with or without hyphens
    const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
    return isbnRegex.test(isbn.replace(/[-\s]/g, ''));
};

/**
 * Validate positive number (must be > 0)
 * @param {number} num - Number to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {boolean} True if valid positive number
 */
const validatePositiveNumber = (num, fieldName = 'value') => {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum) || parsedNum <= 0) {
        return false;
    }
    return true;
};

/**
 * Validate non-negative integer (must be >= 0)
 * @param {number} num - Number to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {boolean} True if valid non-negative integer
 */
const validateNonNegativeInteger = (num, fieldName = 'value') => {
    const parsedNum = parseInt(num, 10);
    if (isNaN(parsedNum) || parsedNum < 0) {
        return false;
    }
    return true;
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid length
 */
const validateStringLength = (str, min = 0, max = Infinity) => {
    if (typeof str !== 'string') return false;
    const length = str.trim().length;
    return length >= min && length <= max;
};

/**
 * Validate category (ENUM validation)
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid category
 */
const validateCategory = (category) => {
    const validCategories = ['Science', 'Art', 'Religion', 'History', 'Geography'];
    return validCategories.includes(category);
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid username
 */
const validateUsername = (username) => {
    // Username: 3-50 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid password
 */
const validatePassword = (password) => {
    // At least 6 characters
    return typeof password === 'string' && password.length >= 6;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
const validatePhone = (phone) => {
    // Basic phone validation (digits, spaces, parentheses, hyphens, plus signs)
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

// =====================================================
// VALIDATION MIDDLEWARE FUNCTIONS
// =====================================================

/**
 * Registration validation middleware
 */
const validateRegistration = [
    validateRequired(['username', 'password', 'first_name', 'last_name', 'email']),
    (req, res, next) => {
        const { username, password, email, phone, first_name, last_name } = req.body;
        const errors = {};
        
        // Username validation
        if (username && !validateUsername(username)) {
            errors.username = 'Username must be 3-50 characters, alphanumeric and underscores only';
        }
        
        // Password validation
        if (password && !validatePassword(password)) {
            errors.password = 'Password must be at least 6 characters long';
        }
        
        // Email validation
        if (email && !validateEmail(email)) {
            errors.email = 'Invalid email format';
        }
        
        // Name validation
        if (first_name && !validateStringLength(first_name, 1, 100)) {
            errors.first_name = 'First name must be between 1 and 100 characters';
        }
        
        if (last_name && !validateStringLength(last_name, 1, 100)) {
            errors.last_name = 'Last name must be between 1 and 100 characters';
        }
        
        // Phone validation (optional)
        if (phone && phone.trim() !== '' && !validatePhone(phone)) {
            errors.phone = 'Invalid phone number format';
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        
        next();
    }
];

/**
 * Login validation middleware
 */
const validateLogin = [
    validateRequired(['username', 'password']),
    (req, res, next) => {
        const { username, password } = req.body;
        const errors = {};
        
        // Username validation
        if (username && !validateStringLength(username, 1, 50)) {
            errors.username = 'Username must be between 1 and 50 characters';
        }
        
        // Password validation
        if (password && !validateStringLength(password, 1, 255)) {
            errors.password = 'Password must be between 1 and 255 characters';
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        
        next();
    }
];

/**
 * Book data validation middleware
 */
const validateBookData = [
    validateRequired(['isbn', 'title', 'publisher_id', 'price', 'category']),
    (req, res, next) => {
        const { 
            isbn, title, publisher_id, publication_year, 
            price, category, quantity_in_stock, threshold_quantity 
        } = req.body;
        const errors = {};
        
        // ISBN validation
        if (isbn && !validateISBN(isbn)) {
            errors.isbn = 'Invalid ISBN format';
        }
        
        // Title validation
        if (title && !validateStringLength(title, 1, 255)) {
            errors.title = 'Title must be between 1 and 255 characters';
        }
        
        // Publisher ID validation
        if (publisher_id && (!validateNonNegativeInteger(publisher_id) || parseInt(publisher_id) <= 0)) {
            errors.publisher_id = 'Publisher ID must be a positive integer';
        }
        
        // Publication year validation
        if (publication_year && publication_year !== '') {
            const year = parseInt(publication_year);
            const currentYear = new Date().getFullYear();
            if (isNaN(year) || year < 1000 || year > currentYear + 5) {
                errors.publication_year = `Publication year must be between 1000 and ${currentYear + 5}`;
            }
        }
        
        // Price validation
        if (price && !validatePositiveNumber(price)) {
            errors.price = 'Price must be a positive number greater than 0';
        }
        
        // Category validation
        if (category && !validateCategory(category)) {
            errors.category = 'Invalid category. Must be one of: Science, Art, Religion, History, Geography';
        }
        
        // Quantity in stock validation
        if (quantity_in_stock !== undefined && quantity_in_stock !== '') {
            if (!validateNonNegativeInteger(quantity_in_stock)) {
                errors.quantity_in_stock = 'Quantity in stock must be a non-negative integer';
            }
        }
        
        // Threshold quantity validation
        if (threshold_quantity !== undefined && threshold_quantity !== '') {
            if (!validateNonNegativeInteger(threshold_quantity)) {
                errors.threshold_quantity = 'Threshold quantity must be a non-negative integer';
            }
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        
        next();
    }
];

/**
 * Authors validation middleware
 */
const validateAuthors = (req, res, next) => {
    const { authors } = req.body;
    
    if (!authors) {
        return next(); // Authors are optional
    }
    
    if (!Array.isArray(authors)) {
        return res.status(400).json({
            error: 'Authors must be an array'
        });
    }
    
    const errors = {};
    
    authors.forEach((author, index) => {
        if (typeof author !== 'string' || !validateStringLength(author.trim(), 1, 255)) {
            errors[`author_${index}`] = `Author ${index + 1} must be a non-empty string with max 255 characters`;
        }
    });
    
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            error: 'Authors validation failed',
            details: errors
        });
    }
    
    next();
};

/**
 * Cart item validation middleware
 */
const validateCartItem = [
    validateRequired(['isbn', 'quantity']),
    (req, res, next) => {
        const { isbn, quantity } = req.body;
        const errors = {};
        
        // ISBN validation
        if (isbn && !validateISBN(isbn)) {
            errors.isbn = 'Invalid ISBN format';
        }
        
        // Quantity validation
        if (quantity !== undefined && quantity !== '') {
            if (!validateNonNegativeInteger(quantity) || parseInt(quantity) <= 0) {
                errors.quantity = 'Quantity must be a positive integer';
            }
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Cart item validation failed',
                details: errors
            });
        }
        
        next();
    }
];

/**
 * Order data validation middleware
 */
const validateOrderData = [
    validateRequired(['isbn', 'publisher_id', 'quantity']),
    (req, res, next) => {
        const { isbn, publisher_id, quantity } = req.body;
        const errors = {};
        
        // ISBN validation
        if (isbn && !validateISBN(isbn)) {
            errors.isbn = 'Invalid ISBN format';
        }
        
        // Publisher ID validation
        if (publisher_id && (!validateNonNegativeInteger(publisher_id) || parseInt(publisher_id) <= 0)) {
            errors.publisher_id = 'Publisher ID must be a positive integer';
        }
        
        // Quantity validation
        if (quantity && !validateNonNegativeInteger(quantity) || parseInt(quantity) <= 0) {
            errors.quantity = 'Quantity must be a positive integer';
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Order validation failed',
                details: errors
            });
        }
        
        next();
    }
];

/**
 * Publisher data validation middleware
 */
const validatePublisherData = [
    validateRequired(['name']),
    (req, res, next) => {
        const { name, address, phone } = req.body;
        const errors = {};
        
        // Name validation
        if (name && !validateStringLength(name, 1, 255)) {
            errors.name = 'Publisher name must be between 1 and 255 characters';
        }
        
        // Address validation (optional)
        if (address && address.trim() !== '' && !validateStringLength(address, 1, 1000)) {
            errors.address = 'Address must be less than 1000 characters';
        }
        
        // Phone validation (optional)
        if (phone && phone.trim() !== '' && !validatePhone(phone)) {
            errors.phone = 'Invalid phone number format';
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Publisher validation failed',
                details: errors
            });
        }
        
        next();
    }
];

// =====================================================
// DYNAMIC VALIDATION MIDDLEWARE GENERATOR
// =====================================================

/**
 * Create custom validation middleware based on rules
 * @param {Object} rules - Validation rules object
 * @returns {Function} Middleware function
 */
const createValidator = (rules) => {
    return (req, res, next) => {
        const errors = {};
        
        Object.keys(rules).forEach(field => {
            const fieldRules = rules[field];
            const value = req.body[field];
            
            // Required check
            if (fieldRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
                errors[field] = `${field} is required`;
                return;
            }
            
            // Skip other validations if field is empty and not required
            if (!value && !fieldRules.required) return;
            
            // Type validation
            if (fieldRules.type) {
                switch (fieldRules.type) {
                    case 'string':
                        if (typeof value !== 'string') {
                            errors[field] = `${field} must be a string`;
                            return;
                        }
                        break;
                    case 'number':
                        if (typeof value !== 'number' && isNaN(parseFloat(value))) {
                            errors[field] = `${field} must be a number`;
                            return;
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(value)) {
                            errors[field] = `${field} must be an array`;
                            return;
                        }
                        break;
                }
            }
            
            // Length validation for strings
            if (fieldRules.type === 'string' && value) {
                const length = value.trim().length;
                if (fieldRules.min && length < fieldRules.min) {
                    errors[field] = `${field} must be at least ${fieldRules.min} characters`;
                    return;
                }
                if (fieldRules.max && length > fieldRules.max) {
                    errors[field] = `${field} must be less than ${fieldRules.max} characters`;
                    return;
                }
            }
            
            // Min/Max validation for numbers
            if ((fieldRules.type === 'number' || typeof value === 'number') && value !== '') {
                const num = parseFloat(value);
                if (fieldRules.min && num < fieldRules.min) {
                    errors[field] = `${field} must be at least ${fieldRules.min}`;
                    return;
                }
                if (fieldRules.max && num > fieldRules.max) {
                    errors[field] = `${field} must be less than ${fieldRules.max}`;
                    return;
                }
            }
            
            // Custom validation function
            if (fieldRules.validate && typeof fieldRules.validate === 'function') {
                const isValid = fieldRules.validate(value);
                if (!isValid) {
                    errors[field] = fieldRules.message || `${field} is invalid`;
                }
            }
            
            // Regex validation
            if (fieldRules.pattern && value) {
                const regex = new RegExp(fieldRules.pattern);
                if (!regex.test(value)) {
                    errors[field] = fieldRules.message || `${field} format is invalid`;
                }
            }
        });
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        
        next();
    };
};

// Export all validation functions and middleware
module.exports = {
    // General validation functions
    validateRequired,
    validateEmail,
    validateISBN,
    validatePositiveNumber,
    validateNonNegativeInteger,
    validateStringLength,
    validateCategory,
    validateUsername,
    validatePassword,
    validatePhone,
    
    // Validation middleware
    validateRegistration,
    validateLogin,
    validateBookData,
    validateAuthors,
    validateCartItem,
    validateOrderData,
    validatePublisherData,
    
    // Dynamic validation
    createValidator
};
