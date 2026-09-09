-- ============================================
-- MediStock Database Schema
-- Run this file in MySQL to create all tables
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS medistock;
USE medistock;

-- ---- USERS TABLE ----
-- Stores registered pharmacy owners/users
CREATE TABLE IF NOT EXISTS users (
    user_id    INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,   -- bcrypt hashed password
    created_at DATETIME,
    updated_at DATETIME
);

-- ---- MEDICINES TABLE ----
-- Stores medicine inventory for each user
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    company_name  VARCHAR(100) NOT NULL,
    batch_no      VARCHAR(50)  NOT NULL,
    expiry_date   DATE         NOT NULL,
    quantity      INT          NOT NULL DEFAULT 0,
    price         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at    DATETIME,
    updated_at    DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---- CUSTOMERS TABLE ----
-- Stores billing/invoice records
-- Each row = one medicine item in one invoice
-- Multiple rows can have the same invoice_no (multi-item bills)
CREATE TABLE IF NOT EXISTS customers (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    customer_id   VARCHAR(20)  NOT NULL,
    user_id       INT          NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    mobile        VARCHAR(15)  NOT NULL,
    doctor_name   VARCHAR(100) NOT NULL,
    visit_date    DATE         NOT NULL,
    invoice_no    VARCHAR(30)  NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    quantity      INT          NOT NULL,
    price         DECIMAL(10,2) NOT NULL,
    total_amount  DECIMAL(10,2) NOT NULL,
    created_at    DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
