CREATE DATABASE IF NOT EXISTS store_rating_system;
USE store_rating_system;
source c:\Users\viswa\task\server\database.sql
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role ENUM('user', 'admin', 'store_owner') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    store_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE KEY unique_rating (user_id, store_id)
);

-- Create an admin user (password: Admin@123)
INSERT INTO users (name, email, password, address, role) 
VALUES (
    'System Administrator',
    'admin@system.com',
    '$2a$10$YourHashedPasswordHere',
    'System Address',
    'admin'
);