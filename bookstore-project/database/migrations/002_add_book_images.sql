-- Migration: Add image support to Books table
USE bookstore_db;

-- Add image_url column to Books table

-- Add soft delete support

-- Add index for non-deleted books
CREATE INDEX idx_books_active ON Books(deleted_at);