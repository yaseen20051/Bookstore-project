-- Migration: Add performance indexes
USE bookstore_db;

-- Composite indexes for common queries
CREATE INDEX idx_sales_customer_date ON Sales(customer_id, sale_date DESC);
CREATE INDEX idx_books_category_price ON Books(category, price);
CREATE INDEX idx_books_stock_threshold ON Books(quantity_in_stock, threshold_quantity);
CREATE INDEX idx_publisher_orders_status_date ON Publisher_Orders(status, order_date DESC);

-- Full-text search for books
ALTER TABLE Books ADD FULLTEXT INDEX idx_books_search (title, ISBN);
ALTER TABLE Authors ADD FULLTEXT INDEX idx_authors_search (author_name);