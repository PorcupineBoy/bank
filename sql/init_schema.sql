CREATE DATABASE IF NOT EXISTS bank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bank_db;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` BIGINT NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(20) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `trade_password_hash` VARCHAR(255) DEFAULT NULL,
  `real_name` VARCHAR(50) NOT NULL,
  `id_card_encrypted` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 0,
  `login_fail_count` INT NOT NULL DEFAULT 0,
  `trade_fail_count` INT NOT NULL DEFAULT 0,
  `single_limit` DECIMAL(15,2) NOT NULL DEFAULT 50000.00,
  `daily_limit` DECIMAL(15,2) NOT NULL DEFAULT 200000.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bank_card` (
  `card_id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `card_no_encrypted` VARCHAR(255) NOT NULL,
  `card_no_masked` VARCHAR(30) NOT NULL,
  `bank_name` VARCHAR(100) NOT NULL,
  `card_type` TINYINT NOT NULL,
  `is_default` TINYINT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 0,
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `bind_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`card_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `transaction` (
  `trans_id` BIGINT NOT NULL AUTO_INCREMENT,
  `trans_no` VARCHAR(64) NOT NULL,
  `user_id` BIGINT NOT NULL,
  `card_id` BIGINT NOT NULL,
  `trans_type` TINYINT NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payee_name` VARCHAR(50) DEFAULT NULL,
  `payee_card_no_masked` VARCHAR(30) DEFAULT NULL,
  `payee_bank_name` VARCHAR(100) DEFAULT NULL,
  `remark` VARCHAR(200) DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`trans_id`),
  UNIQUE KEY `uk_trans_no` (`trans_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `operation_log` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `operation_type` VARCHAR(50) NOT NULL,
  `operation_detail` TEXT NOT NULL,
  `operation_result` TINYINT NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(50) NOT NULL,
  `device_info` VARCHAR(200) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
