// server/routes/books.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Search books
router.get('/search', bookController.searchBooks);

// Get all books
router.get('/', bookController.getAllBooks);

// Get book by ISBN
router.get('/:isbn', bookController.getBookByISBN);

// Get all categories
router.get('/categories/list', bookController.getCategories);

// Get all publishers
router.get('/publishers/list', bookController.getPublishers);

// Get all authors
router.get('/authors/list', bookController.getAuthors);

module.exports = router;
