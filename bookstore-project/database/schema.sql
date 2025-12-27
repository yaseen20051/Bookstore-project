-- database/schema.sql
DROP DATABASE IF EXISTS bookstore_db;

-- Create new database
CREATE DATABASE bookstore_db;

-- SELECT the database to use
USE bookstore_db;

-- =====================================================
-- TABLES
-- =====================================================

-- Publishers Table
CREATE TABLE Publishers (
    publisher_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20)
);

-- Books Table
CREATE TABLE Books (
    ISBN VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publisher_id INT,
    publication_year INT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category ENUM('Science', 'Art', 'Religion', 'History', 'Geography') NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    threshold_quantity INT NOT NULL DEFAULT 10 CHECK (threshold_quantity >= 0),
    FOREIGN KEY (publisher_id) REFERENCES Publishers(publisher_id)
);

-- Authors Table
CREATE TABLE Authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    author_name VARCHAR(255) NOT NULL
);

-- Book_Authors Junction Table
CREATE TABLE Book_Authors (
    ISBN VARCHAR(20),
    author_id INT,
    PRIMARY KEY (ISBN, author_id),
    FOREIGN KEY (ISBN) REFERENCES Books(ISBN) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE CASCADE
);

-- Publisher Orders Table
CREATE TABLE Publisher_Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    ISBN VARCHAR(20),  -- ✅ CHANGED FROM VARCHAR(13) TO VARCHAR(20)
    publisher_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
    confirmation_date DATETIME NULL,
    FOREIGN KEY (ISBN) REFERENCES Books(ISBN),
    FOREIGN KEY (publisher_id) REFERENCES Publishers(publisher_id)
);

-- Customers Table
CREATE TABLE Customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    shipping_address TEXT
);

-- Shopping Carts Table
CREATE TABLE Shopping_Carts (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- Cart Items Table
CREATE TABLE Cart_Items (
    cart_id INT,
    ISBN VARCHAR(20),
    quantity INT NOT NULL CHECK (quantity > 0),
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, ISBN),
    FOREIGN KEY (cart_id) REFERENCES Shopping_Carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (ISBN) REFERENCES Books(ISBN)
);

-- Sales Table
CREATE TABLE Sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    credit_card_last4 VARCHAR(4),
    card_expiry VARCHAR(7),
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- Sale Items Table
CREATE TABLE Sale_Items (
    sale_id INT,
    ISBN VARCHAR(20),
    quantity INT NOT NULL,
    price_at_sale DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (sale_id, ISBN),
    FOREIGN KEY (sale_id) REFERENCES Sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (ISBN) REFERENCES Books(ISBN)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_books_category ON Books(category);
CREATE INDEX idx_books_publisher ON Books(publisher_id);
CREATE INDEX idx_book_authors_author ON Book_Authors(author_id);
CREATE INDEX idx_sales_customer ON Sales(customer_id);
CREATE INDEX idx_sales_date ON Sales(sale_date);
CREATE INDEX idx_orders_status ON Publisher_Orders(status);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Database schema created successfully!' AS Message;
SHOW TABLES;