-- ChillarTrack Database Schema
-- MySQL 8.0+
-- Run this to create the database and tables manually (JPA also auto-creates via ddl-auto=update)

CREATE DATABASE IF NOT EXISTS chillartrack;
USE chillartrack;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    monthly_budget DECIMAL(10,2) DEFAULT 5000.00,
    weekly_limit DECIMAL(10,2) DEFAULT 1500.00,
    currency VARCHAR(3) DEFAULT 'INR',
    profile_photo_url VARCHAR(500),
    email_verification_token VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category ENUM('FOOD_AND_TAPRI','TRANSPORT','PRINTOUTS_AND_STATIONERY',
                  'ENTERTAINMENT','SHOPPING','EDUCATION','MISCELLANEOUS') NOT NULL,
    description VARCHAR(255),
    transaction_date DATETIME NOT NULL,
    payment_method ENUM('CASH','UPI','DEBIT_CARD','CREDIT_CARD') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transactions_user (user_id),
    INDEX idx_transactions_date (transaction_date),
    INDEX idx_transactions_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Savings Goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    target_date DATE,
    image_url VARCHAR(500),
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type ENUM('BUDGET_ALERT','GOAL_REMINDER','SPENDING_SPIKE','ENTERTAINMENT_LIMIT',
              'WEEKLY_SUMMARY','ACHIEVEMENT_EARNED','SYSTEM') NOT NULL,
    `read` BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (user_id, `read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    badge ENUM('SMART_SAVER','NO_SPEND_NINJA','BUDGET_MASTER','GOAL_CRUSHER',
               'STREAK_STARTER','THRIFTY_TEEN') NOT NULL,
    description VARCHAR(255) NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_badge (user_id, badge),
    INDEX idx_achievements_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
