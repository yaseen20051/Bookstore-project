-- database/schema_updates.sql
USE bookstore_db;



-- Add columns to Books
ALTER TABLE Books ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER title;
ALTER TABLE Books ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER threshold_quantity;
ALTER TABLE Books ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted;

-- Add status to Sales
ALTER TABLE Sales ADD COLUMN IF NOT EXISTS status ENUM('Pending', 'Processing', 'Completed', 'Cancelled') DEFAULT 'Completed' AFTER card_expiry;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_books_deleted ON Books(is_deleted);
CREATE INDEX IF NOT EXISTS idx_books_stock ON Books(quantity_in_stock);
CREATE INDEX IF NOT EXISTS idx_books_title ON Books(title);
CREATE INDEX IF NOT EXISTS idx_customers_email ON Customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_username ON Customers(username);

-- Default admin user (password: admin123)
INSERT INTO Admins (username, password_hash, email) 
VALUES ('admin', '$2b$10$rBV2KWc8L9g5tIcGCkQxWePQvL3HrYJ3QqYf8yqfBxE9nFJvKxQNm', 'admin@bookstore.com') 
ON DUPLICATE KEY UPDATE username=username;