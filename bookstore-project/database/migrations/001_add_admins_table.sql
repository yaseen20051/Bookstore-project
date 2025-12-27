-- Migration: Add Admins table
USE bookstore_db;



-- Add index for faster lookups
CREATE INDEX idx_admin_username ON Admins(username);
CREATE INDEX idx_admin_email ON Admins(email);