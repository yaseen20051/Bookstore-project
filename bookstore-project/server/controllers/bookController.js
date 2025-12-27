// server/controllers/bookController.js
const db = require('../../database/connection');

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.*, p.name as publisher_name,
                   GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            GROUP BY b.ISBN
            ORDER BY b.title
        `);
        
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const { isbn, title, category, author, publisher } = req.query;
        
        let query = `
            SELECT DISTINCT b.*, p.name as publisher_name,
                   GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
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
        
        query += ' GROUP BY b.ISBN ORDER BY b.title';
        
        const [books] = await db.query(query, params);
        res.json(books);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

// Get book by ISBN
exports.getBookByISBN = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.*, p.name as publisher_name,
                   GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
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
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT DISTINCT category 
            FROM Books 
            ORDER BY category
        `);
        
        res.json(categories.map(c => c.category));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// Get all publishers
exports.getPublishers = async (req, res) => {
    try {
        const [publishers] = await db.query(`
            SELECT * FROM Publishers ORDER BY name
        `);
        
        res.json(publishers);
    } catch (error) {
        console.error('Error fetching publishers:', error);
        res.status(500).json({ error: 'Failed to fetch publishers' });
    }
};

// Get all authors
exports.getAuthors = async (req, res) => {
    try {
        const [authors] = await db.query(`
            SELECT * FROM Authors ORDER BY author_name
        `);
        
        res.json(authors);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Failed to fetch authors' });
    }
};