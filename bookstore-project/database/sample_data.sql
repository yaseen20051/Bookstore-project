
-- =====================================================
-- BOOKSTORE SAMPLE DATA
-- =====================================================
-- This file populates the database with realistic test data
-- Run after schema.sql and triggers.sql

USE bookstore_db;

-- =====================================================
-- CLEAR EXISTING DATA (optional - for testing)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Sale_Items;
TRUNCATE TABLE Sales;
TRUNCATE TABLE Cart_Items;
TRUNCATE TABLE Shopping_Carts;
TRUNCATE TABLE Publisher_Orders;
TRUNCATE TABLE Book_Authors;
TRUNCATE TABLE Books;
TRUNCATE TABLE Authors;
TRUNCATE TABLE Publishers;
TRUNCATE TABLE Customers;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. PUBLISHERS
-- =====================================================

INSERT INTO Publishers (publisher_id, name, address, phone) VALUES
(1, 'Pearson Education', '221 River Street, Hoboken, NJ 07030', '+1-201-236-7000'),
(2, 'McGraw-Hill Education', '2 Penn Plaza, New York, NY 10121', '+1-212-904-2000'),
(3, 'O''Reilly Media', '1005 Gravenstein Highway North, Sebastopol, CA 95472', '+1-707-827-7000'),
(4, 'Wiley', '111 River Street, Hoboken, NJ 07030', '+1-201-748-6000'),
(5, 'Springer', 'Tiergartenstraße 17, 69121 Heidelberg, Germany', '+49-6221-487-0'),
(6, 'Oxford University Press', 'Great Clarendon Street, Oxford OX2 6DP, UK', '+44-1865-556767'),
(7, 'Cambridge University Press', 'University Printing House, Cambridge CB2 8BS, UK', '+44-1223-358331'),
(8, 'Routledge', '2 Park Square, Milton Park, Abingdon, Oxon OX14 4RN, UK', '+44-20-7017-6000'),
(9, 'National Geographic', '1145 17th Street NW, Washington, DC 20036', '+1-202-857-7000'),
(10, 'DK Publishing', '1450 Broadway, New York, NY 10018', '+1-212-782-9000');

-- =====================================================
-- 2. AUTHORS
-- =====================================================

INSERT INTO Authors (author_id, author_name) VALUES
(1, 'Ramez Elmasri'),
(2, 'Shamkant Navathe'),
(3, 'Abraham Silberschatz'),
(4, 'Henry Korth'),
(5, 'S. Sudarshan'),
(6, 'Robert C. Martin'),
(7, 'Martin Fowler'),
(8, 'Eric Freeman'),
(9, 'Elisabeth Robson'),
(10, 'Kathy Sierra'),
(11, 'Bert Bates'),
(12, 'Joshua Bloch'),
(13, 'Brian Goetz'),
(14, 'Thomas H. Cormen'),
(15, 'Charles E. Leiserson'),
(16, 'Ronald L. Rivest'),
(17, 'Clifford Stein'),
(18, 'Donald E. Knuth'),
(19, 'Andrew S. Tanenbaum'),
(20, 'William Stallings'),
(21, 'Leonardo da Vinci'),
(22, 'Giorgio Vasari'),
(23, 'Ernst Gombrich'),
(24, 'Karen Armstrong'),
(25, 'Huston Smith'),
(26, 'Yuval Noah Harari'),
(27, 'Jared Diamond'),
(28, 'David McCullough'),
(29, 'Simon Schama'),
(30, 'Jared Diamond');

-- =====================================================
-- 3. BOOKS
-- =====================================================

INSERT INTO Books (ISBN, title, publisher_id, publication_year, price, category, quantity_in_stock, threshold_quantity) VALUES
-- Science Books
('978-0133970777', 'Fundamentals of Database Systems', 1, 2015, 125.00, 'Science', 25, 10),
('978-0073523323', 'Database System Concepts', 2, 2019, 115.50, 'Science', 18, 10),
('978-0134685991', 'Effective Java', 1, 2018, 54.99, 'Science', 30, 15),
('978-0132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 1, 2008, 47.99, 'Science', 22, 10),
('978-0201633610', 'Design Patterns: Elements of Reusable Object-Oriented Software', 1, 1994, 64.99, 'Science', 15, 8),
('978-0596009205', 'Head First Design Patterns', 3, 2004, 49.99, 'Science', 28, 12),
('978-0596007126', 'Head First Java', 3, 2005, 44.99, 'Science', 20, 10),
('978-0262033848', 'Introduction to Algorithms', 1, 2009, 89.00, 'Science', 12, 8),
('978-0134494166', 'The C Programming Language', 1, 1988, 62.00, 'Science', 16, 8),
('978-0137081073', 'The Clean Coder', 1, 2011, 39.99, 'Science', 19, 10),
('978-0321573513', 'Algorithms', 1, 2011, 79.99, 'Science', 14, 8),
('978-0132764025', 'Operating System Concepts', 4, 2018, 98.00, 'Science', 11, 8),
('978-0136006329', 'Modern Operating Systems', 1, 2014, 87.50, 'Science', 13, 8),
('978-0133594140', 'Computer Networks', 1, 2021, 92.00, 'Science', 17, 10),
('978-0134670959', 'Cryptography and Network Security', 1, 2016, 105.00, 'Science', 9, 8),

-- Art Books
('978-0714847030', 'The Story of Art', 6, 2016, 39.95, 'Art', 20, 10),
('978-0500238370', 'Art: The Definitive Visual Guide', 10, 2018, 50.00, 'Art', 15, 8),
('978-0714869841', 'Leonardo da Vinci: The Complete Paintings', 6, 2019, 65.00, 'Art', 12, 8),
('978-0140445008', 'Lives of the Artists', 6, 1998, 18.00, 'Art', 18, 10),
('978-0500239582', 'The Art Book', 6, 2014, 29.95, 'Art', 22, 10),
('978-0195399844', 'Gardner''s Art Through the Ages', 6, 2015, 145.00, 'Art', 8, 5),
('978-0500204191', 'The Story of Painting', 6, 2016, 42.00, 'Art', 14, 8),
('978-0300090239', 'Janson''s History of Art', 6, 2010, 132.00, 'Art', 7, 5),

-- Religion Books
('978-0060655402', 'A History of God', 6, 1994, 19.99, 'Religion', 25, 12),
('978-0061660184', 'The World''s Religions', 6, 2009, 18.99, 'Religion', 20, 10),
('978-0195149982', 'The Bible: Authorized King James Version', 6, 2008, 12.95, 'Religion', 30, 15),
('978-0143107095', 'The Bhagavad Gita', 6, 2008, 14.00, 'Religion', 18, 10),
('978-0140449617', 'The Quran', 6, 2006, 15.00, 'Religion', 22, 12),
('978-0061142109', 'The Case for Christ', 7, 2016, 16.99, 'Religion', 16, 10),
('978-0385721240', 'God Is Not Great', 6, 2008, 16.00, 'Religion', 14, 8),
('978-0143038412', 'The God Delusion', 6, 2008, 18.00, 'Religion', 12, 8),

-- History Books
('978-0062316097', 'Sapiens: A Brief History of Humankind', 4, 2018, 24.99, 'History', 35, 15),
('978-0062464347', 'Homo Deus: A Brief History of Tomorrow', 4, 2017, 22.99, 'History', 28, 12),
('978-0393354324', 'Guns, Germs, and Steel', 4, 2017, 19.99, 'History', 24, 12),
('978-0684824192', '1776', 7, 2006, 18.00, 'History', 20, 10),
('978-0307741769', 'The Wright Brothers', 7, 2016, 19.99, 'History', 18, 10),
('978-0143127505', 'SPQR: A History of Ancient Rome', 8, 2016, 20.00, 'History', 15, 10),
('978-0393966565', 'A People''s History of the United States', 8, 2015, 22.00, 'History', 22, 10),
('978-0679640998', 'The Guns of August', 8, 2014, 18.95, 'History', 16, 8),
('978-0375758959', 'Team of Rivals', 7, 2006, 22.00, 'History', 13, 8),
('978-0812974492', 'The Rise and Fall of the Third Reich', 7, 2011, 25.00, 'History', 11, 8),

-- Geography Books
('978-1426213953', 'National Geographic Atlas of the World', 9, 2019, 175.00, 'Geography', 10, 5),
('978-0756698201', 'Complete Geography of the World', 10, 2019, 45.00, 'Geography', 14, 8),
('978-1426217746', 'National Geographic Destinations of a Lifetime', 9, 2015, 35.00, 'Geography', 18, 10),
('978-1426220821', 'National Geographic Visual History of the World', 9, 2018, 50.00, 'Geography', 12, 8),
('978-0062315595', 'Prisoners of Geography', 4, 2016, 18.00, 'Geography', 20, 10),
('978-1426220647', 'National Geographic Complete National Parks', 9, 2016, 40.00, 'Geography', 15, 8),
('978-0062896315', 'The Power of Geography', 4, 2021, 28.00, 'Geography', 16, 10),
('978-1426221293', 'Atlas of the World''s Languages', 9, 2019, 65.00, 'Geography', 8, 5);

-- =====================================================
-- 4. BOOK_AUTHORS (Link books to authors)
-- =====================================================

INSERT INTO Book_Authors (ISBN, author_id) VALUES
-- Database books
('978-0133970777', 1),
('978-0133970777', 2),
('978-0073523323', 3),
('978-0073523323', 4),
('978-0073523323', 5),

-- Java/Programming books
('978-0134685991', 12),
('978-0132350884', 6),
('978-0596009205', 8),
('978-0596009205', 9),
('978-0596007126', 10),
('978-0596007126', 11),
('978-0137081073', 6),

-- Algorithms books
('978-0262033848', 14),
('978-0262033848', 15),
('978-0262033848', 16),
('978-0262033848', 17),
('978-0134494166', 18),

-- Operating Systems
('978-0132764025', 3),
('978-0136006329', 19),
('978-0133594140', 19),
('978-0134670959', 20),

-- Art books
('978-0714847030', 23),
('978-0714869841', 21),
('978-0140445008', 22),

-- Religion books
('978-0060655402', 24),
('978-0061660184', 25),

-- History books
('978-0062316097', 26),
('978-0062464347', 26),
('978-0393354324', 27),
('978-0393354324', 30),
('978-0684824192', 28),
('978-0307741769', 28),
('978-0143127505', 29);

-- =====================================================
-- 5. CUSTOMERS
-- =====================================================
-- Note: Passwords are hashed using bcrypt
-- Plain passwords: 'password123' for all test accounts

INSERT INTO Customers (customer_id, username, password_hash, first_name, last_name, email, phone, shipping_address) VALUES
(1, 'ahmed_mostafa', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Ahmed', 'Mostafa', 'ahmed.mostafa@email.com', '+20-100-123-4567', '15 Tahrir Square, Cairo, Egypt'),
(2, 'sara_hassan', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Sara', 'Hassan', 'sara.hassan@email.com', '+20-101-234-5678', '25 El Nasr Street, Alexandria, Egypt'),
(3, 'mohamed_ali', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Mohamed', 'Ali', 'mohamed.ali@email.com', '+20-102-345-6789', '30 Pyramid Street, Giza, Egypt'),
(4, 'fatma_ahmed', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Fatma', 'Ahmed', 'fatma.ahmed@email.com', '+20-103-456-7890', '10 Corniche Road, Port Said, Egypt'),
(5, 'omar_khaled', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Omar', 'Khaled', 'omar.khaled@email.com', '+20-104-567-8901', '5 University Street, Aswan, Egypt'),
(6, 'mona_said', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Mona', 'Said', 'mona.said@email.com', '+20-105-678-9012', '18 Mahmoud Street, Luxor, Egypt'),
(7, 'youssef_ibrahim', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Youssef', 'Ibrahim', 'youssef.ibrahim@email.com', '+20-106-789-0123', '22 Salah Salem Road, Cairo, Egypt'),
(8, 'nour_mahmoud', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Nour', 'Mahmoud', 'nour.mahmoud@email.com', '+20-107-890-1234', '12 Sharia Street, Mansoura, Egypt'),
(9, 'heba_gamal', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Heba', 'Gamal', 'heba.gamal@email.com', '+20-108-901-2345', '8 Ramses Street, Zagazig, Egypt'),
(10, 'kareem_fathy', '$2b$10$rQ3qZ8xJvYgYxVnJGXj0q.eJyZ5X8N1KwP8vLQYxFjNHGXdJZY8Zm', 'Kareem', 'Fathy', 'kareem.fathy@email.com', '+20-109-012-3456', '35 Corniche, Hurghada, Egypt');

-- =====================================================
-- 6. SHOPPING CARTS
-- =====================================================

INSERT INTO Shopping_Carts (cart_id, customer_id, created_date, is_active) VALUES
(1, 1, '2025-12-27 10:00:00', TRUE),
(2, 2, '2025-12-27 11:30:00', TRUE),
(3, 3, '2025-12-27 12:15:00', TRUE),
(4, 4, '2025-12-26 14:00:00', FALSE), -- Old cart
(5, 5, '2025-12-27 09:30:00', TRUE);

-- =====================================================
-- 7. CART ITEMS (Current active carts)
-- =====================================================

INSERT INTO Cart_Items (cart_id, ISBN, quantity, added_date) VALUES
-- Ahmed's cart (customer 1)
(1, '978-0133970777', 1, '2025-12-27 10:05:00'),
(1, '978-0134685991', 2, '2025-12-27 10:10:00'),

-- Sara's cart (customer 2)
(2, '978-0062316097', 1, '2025-12-27 11:35:00'),
(2, '978-0714847030', 1, '2025-12-27 11:40:00'),

-- Mohamed's cart (customer 3)
(3, '978-0132350884', 1, '2025-12-27 12:20:00'),
(3, '978-0596009205', 1, '2025-12-27 12:25:00'),
(3, '978-0596007126', 1, '2025-12-27 12:30:00'),

-- Omar's cart (customer 5)
(5, '978-1426213953', 1, '2025-12-27 09:35:00');

-- =====================================================
-- 8. SALES (Past orders - last 3 months)
-- =====================================================

INSERT INTO Sales (sale_id, customer_id, sale_date, total_amount, credit_card_last4, card_expiry) VALUES
-- October 2025
(1, 1, '2025-10-05 14:30:00', 192.99, '1234', '12/2027'),
(2, 2, '2025-10-10 16:45:00', 125.00, '5678', '03/2028'),
(3, 3, '2025-10-15 11:20:00', 89.00, '9012', '06/2026'),
(4, 4, '2025-10-20 13:15:00', 54.99, '3456', '09/2027'),

-- November 2025
(5, 5, '2025-11-02 10:00:00', 164.98, '7890', '11/2028'),
(6, 6, '2025-11-08 15:30:00', 97.98, '2345', '01/2027'),
(7, 7, '2025-11-12 12:45:00', 44.99, '6789', '04/2028'),
(8, 1, '2025-11-18 14:20:00', 115.50, '1234', '12/2027'),
(9, 8, '2025-11-22 16:10:00', 139.98, '0123', '07/2026'),
(10, 9, '2025-11-25 11:30:00', 79.99, '4567', '10/2027'),

-- December 2025
(11, 2, '2025-12-01 09:15:00', 64.99, '5678', '03/2028'),
(12, 10, '2025-12-05 13:40:00', 112.99, '8901', '05/2028'),
(13, 3, '2025-12-10 15:20:00', 87.97, '9012', '06/2026'),
(14, 4, '2025-12-12 10:50:00', 175.00, '3456', '09/2027'),
(15, 6, '2025-12-15 14:30:00', 92.98, '2345', '01/2027'),
(16, 7, '2025-12-18 16:45:00', 54.99, '6789', '04/2028'),
(17, 1, '2025-12-20 11:20:00', 145.00, '1234', '12/2027'),
(18, 5, '2025-12-22 13:15:00', 74.99, '7890', '11/2028'),
(19, 8, '2025-12-24 10:30:00', 39.95, '0123', '07/2026'),
(20, 9, '2025-12-26 15:00:00', 67.99, '4567', '10/2027');

-- =====================================================
-- 9. SALE ITEMS (Items in past orders)
-- =====================================================

INSERT INTO Sale_Items (sale_id, ISBN, quantity, price_at_sale) VALUES
-- Sale 1 (Ahmed - Oct 5)
(1, '978-0133970777', 1, 125.00),
(1, '978-0596007126', 1, 44.99),
(1, '978-0714847030', 1, 39.95),

-- Sale 2 (Sara - Oct 10)
(2, '978-0133970777', 1, 125.00),

-- Sale 3 (Mohamed - Oct 15)
(3, '978-0262033848', 1, 89.00),

-- Sale 4 (Fatma - Oct 20)
(4, '978-0134685991', 1, 54.99),

-- Sale 5 (Omar - Nov 2)
(5, '978-0132350884', 1, 47.99),
(5, '978-0073523323', 1, 115.50),

-- Sale 6 (Mona - Nov 8)
(6, '978-0596009205', 2, 49.99),

-- Sale 7 (Youssef - Nov 12)
(7, '978-0596007126', 1, 44.99),

-- Sale 8 (Ahmed - Nov 18)
(8, '978-0073523323', 1, 115.50),

-- Sale 9 (Nour - Nov 22)
(9, '978-0062316097', 2, 24.99),
(9, '978-0062464347', 2, 22.99),
(9, '978-0393354324', 2, 19.99),

-- Sale 10 (Heba - Nov 25)
(10, '978-0321573513', 1, 79.99),

-- Sale 11 (Sara - Dec 1)
(11, '978-0201633610', 1, 64.99),

-- Sale 12 (Kareem - Dec 5)
(12, '978-0062316097', 1, 24.99),
(12, '978-0134670959', 1, 105.00),

-- Sale 13 (Mohamed - Dec 10)
(13, '978-0137081073', 2, 39.99),

-- Sale 14 (Fatma - Dec 12)
(14, '978-1426213953', 1, 175.00),

-- Sale 15 (Mona - Dec 15)
(15, '978-0132764025', 1, 98.00),

-- Sale 16 (Youssef - Dec 18)
(16, '978-0134685991', 1, 54.99),

-- Sale 17 (Ahmed - Dec 20)
(17, '978-0195399844', 1, 145.00),

-- Sale 18 (Omar - Dec 22)
(18, '978-0062316097', 3, 24.99),

-- Sale 19 (Nour - Dec 24)
(19, '978-0714847030', 1, 39.95),

-- Sale 20 (Heba - Dec 26)
(20, '978-0062464347', 1, 22.99),
(20, '978-0060655402', 1, 19.99),
(20, '978-0061660184', 2, 18.99);

-- =====================================================
-- 10. PUBLISHER ORDERS (Some pending, some confirmed)
-- =====================================================

INSERT INTO Publisher_Orders (order_id, ISBN, publisher_id, order_date, quantity, status, confirmation_date) VALUES
-- Confirmed orders (already received)
(1, '978-0134685991', 1, '2025-11-15 09:00:00', 50, 'Confirmed', '2025-11-20 14:30:00'),
(2, '978-0062316097', 4, '2025-11-18 10:30:00', 50, 'Confirmed', '2025-11-25 11:00:00'),
(3, '978-0596009205', 3, '2025-11-22 14:00:00', 50, 'Confirmed', '2025-11-28 16:45:00'),

-- Pending orders (waiting for delivery)
(4, '978-0262033848', 1, '2025-12-10 11:30:00', 50, 'Pending', NULL),
(5, '978-0132764025', 4, '2025-12-15 13:20:00', 50, 'Pending', NULL),
(6, '978-1426213953', 9, '2025-12-20 09:45:00', 50, 'Pending', NULL),
(7, '978-0714847030', 6, '2025-12-22 15:10:00', 50, 'Pending', NULL),
(8, '978-0195399844', 6, '2025-12-24 10:30:00', 50, 'Pending', NULL);

-- =====================================================
-- DATA INSERTION COMPLETE
-- =====================================================

-- Verify data was inserted
SELECT 'Sample data loaded successfully!' AS Status;

-- Show counts
SELECT 
    (SELECT COUNT(*) FROM Publishers) AS Publishers,
    (SELECT COUNT(*) FROM Authors) AS Authors,
    (SELECT COUNT(*) FROM Books) AS Books,
    (SELECT COUNT(*) FROM Book_Authors) AS Book_Authors,
    (SELECT COUNT(*) FROM Customers) AS Customers,
    (SELECT COUNT(*) FROM Shopping_Carts) AS Shopping_Carts,
    (SELECT COUNT(*) FROM Cart_Items) AS Cart_Items,
    (SELECT COUNT(*) FROM Sales) AS Sales,
    (SELECT COUNT(*) FROM Sale_Items) AS Sale_Items,
    (SELECT COUNT(*) FROM Publisher_Orders) AS Publisher_Orders;