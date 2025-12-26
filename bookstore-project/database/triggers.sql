-- database/triggers.sql
USE bookstore_db;

-- Trigger 1: Prevent negative stock
DELIMITER $$
CREATE TRIGGER prevent_negative_stock
BEFORE UPDATE ON Books
FOR EACH ROW
BEGIN
    IF NEW.quantity_in_stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock quantity cannot be negative';
    END IF;
END$$
DELIMITER ;

-- Trigger 2: Auto-order when stock drops below threshold
DELIMITER $$
CREATE TRIGGER auto_reorder_books
AFTER UPDATE ON Books
FOR EACH ROW
BEGIN
    IF OLD.quantity_in_stock >= OLD.threshold_quantity 
       AND NEW.quantity_in_stock < NEW.threshold_quantity THEN
        INSERT INTO Publisher_Orders (ISBN, publisher_id, quantity, status)
        VALUES (NEW.ISBN, NEW.publisher_id, 50, 'Pending');
    END IF;
END$$
DELIMITER ;

-- Trigger 3: Update stock when order is confirmed
DELIMITER $$
CREATE TRIGGER confirm_order_update_stock
AFTER UPDATE ON Publisher_Orders
FOR EACH ROW
BEGIN
    IF OLD.status = 'Pending' AND NEW.status = 'Confirmed' THEN
        UPDATE Books 
        SET quantity_in_stock = quantity_in_stock + NEW.quantity
        WHERE ISBN = NEW.ISBN;
        
        UPDATE Publisher_Orders
        SET confirmation_date = CURRENT_TIMESTAMP
        WHERE order_id = NEW.order_id;
    END IF;
END$$
DELIMITER ;