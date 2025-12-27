// server/models/book.js
const db = require('../../database/connection');

class Book {
    static async getAll({ page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const [books] = await db.query(`
            SELECT b.*, p.name as publisher_name,
                   GROUP_CONCAT(a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            GROUP BY b.ISBN
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM Books');
        
        return {
            books,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    static async search({ isbn, title, category, author, publisher, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        let query = `
            SELECT DISTINCT b.*, p.name as publisher_name,
                   GROUP_CONCAT(a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE 1=1
        `;

        let countQuery = `
            SELECT COUNT(DISTINCT b.ISBN) as total
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (isbn) {
            query += ' AND b.ISBN = ?';
            countQuery += ' AND b.ISBN = ?';
            params.push(isbn);
        }
        if (title) {
            query += ' AND b.title LIKE ?';
            countQuery += ' AND b.title LIKE ?';
            params.push(`%${title}%`);
        }
        if (category) {
            query += ' AND b.category = ?';
            countQuery += ' AND b.category = ?';
            params.push(category);
        }
        if (author) {
            query += ' AND a.author_name LIKE ?';
            countQuery += ' AND a.author_name LIKE ?';
            params.push(`%${author}%`);
        }
        if (publisher) {
            query += ' AND p.name LIKE ?';
            countQuery += ' AND p.name LIKE ?';
            params.push(`%${publisher}%`);
        }
        
        query += ' GROUP BY b.ISBN LIMIT ? OFFSET ?';
        
        const [books] = await db.query(query, [...params, limit, offset]);
        const [[{ total }]] = await db.query(countQuery, params);
        
        return {
            books,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    static async findByIsbn(isbn) {
        const [books] = await db.query(`
            SELECT b.*, p.name as publisher_name,
                   GROUP_CONCAT(a.author_name SEPARATOR ', ') as authors
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Book_Authors ba ON b.ISBN = ba.ISBN
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE b.ISBN = ?
            GROUP BY b.ISBN
        `, [isbn]);
        
        return books[0];
    }
}

module.exports = Book;
