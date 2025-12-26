// server/routes/books.js
const express = require('express');
const router = express.Router();
const db = require('../../database/connection');

// Search books
router.get('/search', async (req, res) => {
    try {
        const { isbn, title, category, author, publisher } = req.query;
        
        let query = `
            SELECT DISTINCT b.*, p.name as publisher_name,
                   GROUP_CONCAT(a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (isbn) {
            query += ' AND b.ISBN = ?';
            params.push(isbn);
        }
        if (title) {
            query += ' AND b.title LIKE ?';
            params.push(`%${title}%`);
        }
        if (category) {
            query += ' AND b.category = ?';
            params.push(category);
        }
        if (author) {
            query += ' AND a.author_name LIKE ?';
            params.push(`%${author}%`);
        }
        if (publisher) {
            query += ' AND p.name LIKE ?';
            params.push(`%${publisher}%`);
        }
        
        query += ' GROUP BY b.ISBN';
        
        const [books] = await db.query(query, params);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get all books
router.get('/', async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.*, p.name as publisher_name,
                   GROUP_CONCAT(a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            GROUP BY b.ISBN
        `);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get book by ISBN
router.get('/:isbn', async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.*, p.name as publisher_name,
                   GROUP_CONCAT(a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE b.ISBN = ?
            GROUP BY b.ISBN
        `, [req.params.isbn]);
        
        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(books[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

module.exports = router;