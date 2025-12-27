-- Drop existing triggers
USE bookstore_db;

DROP TRIGGER IF EXISTS prevent_negative_stock;
DROP TRIGGER IF EXISTS auto_reorder_books;
DROP TRIGGER IF EXISTS confirm_order_update_stock;
