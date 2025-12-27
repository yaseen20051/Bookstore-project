USE bookstore_db;

-- Insert admin user with proper bcrypt hash
-- Password for this admin is: admin123
INSERT INTO `Admins` (`username`, `password_hash`, `email`) VALUES ('admin', '$2b$10$q3zkH/96ohQuJgGt3evqYu3XKJPM9eNKrPzqosLqSUktT6jFQWTfK', 'admin@example.com');
