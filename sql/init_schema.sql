CREATE DATABASE IF NOT EXISTS bank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bank_db;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识，主键',
  `phone` VARCHAR(20) NOT NULL COMMENT '注册手机号，唯一索引',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '登录密码哈希值',
  `trade_password_hash` VARCHAR(255) DEFAULT NULL COMMENT '交易密码哈希值',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `id_card_encrypted` VARCHAR(255) NOT NULL COMMENT '身份证号（加密存储）',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像地址',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-正常，1-锁定，2-注销',
  `login_fail_count` INT NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
  `trade_fail_count` INT NOT NULL DEFAULT 0 COMMENT '连续交易密码失败次数',
  `single_limit` DECIMAL(15,2) NOT NULL DEFAULT 50000.00 COMMENT '单笔转账限额',
  `daily_limit` DECIMAL(15,2) NOT NULL DEFAULT 200000.00 COMMENT '单日累计转账限额',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bank_card` (
  `card_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '关联用户ID',
  `card_no_encrypted` VARCHAR(255) NOT NULL COMMENT '银行卡号（加密存储）',
  `card_no_masked` VARCHAR(30) NOT NULL COMMENT '脱敏卡号（如 **** **** **** 1234）',
  `bank_name` VARCHAR(100) NOT NULL COMMENT '发卡行名称',
  `card_type` TINYINT NOT NULL COMMENT '卡类型：1-借记卡，2-信用卡',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认卡：0-否，1-是',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-正常，1-已解绑',
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  `bind_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
  PRIMARY KEY (`card_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `transaction` (
  `trans_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '交易唯一标识，主键',
  `trans_no` VARCHAR(64) NOT NULL COMMENT '交易流水号，唯一索引',
  `user_id` BIGINT NOT NULL COMMENT '发起用户ID',
  `card_id` BIGINT NOT NULL COMMENT '付款银行卡ID',
  `trans_type` TINYINT NOT NULL COMMENT '交易类型：1-转账，2-缴费，3-收入',
  `amount` DECIMAL(15,2) NOT NULL COMMENT '交易金额',
  `payee_name` VARCHAR(50) DEFAULT NULL COMMENT '收款人姓名',
  `payee_card_no_masked` VARCHAR(30) DEFAULT NULL COMMENT '收款卡号（脱敏）',
  `payee_bank_name` VARCHAR(100) DEFAULT NULL COMMENT '收款银行名称',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
  `category` TINYINT DEFAULT 0 COMMENT '消费分类：0-其他，1-餐饮，2-购物，3-交通，4-居住，5-医疗，6-教育，7-娱乐，8-金融，9-人情',
  `sub_category` VARCHAR(50) DEFAULT NULL COMMENT '分类细项',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-处理中，1-成功，2-失败',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`trans_id`),
  UNIQUE KEY `uk_trans_no` (`trans_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chat_message` (
  `message_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息唯一标识，主键',
  `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
  `session_id` VARCHAR(64) NOT NULL COMMENT '会话标识',
  `role` TINYINT NOT NULL COMMENT '消息角色：1-用户，2-AI',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `intent` VARCHAR(50) DEFAULT NULL COMMENT '意图识别结果',
  `function_called` VARCHAR(50) DEFAULT NULL COMMENT '调用的函数名',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`message_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `operation_log` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '操作用户ID',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `operation_detail` TEXT NOT NULL COMMENT '操作详情（敏感信息脱敏）',
  `operation_result` TINYINT NOT NULL DEFAULT 0 COMMENT '结果：0-成功，1-失败',
  `ip_address` VARCHAR(50) NOT NULL COMMENT '操作IP',
  `device_info` VARCHAR(200) DEFAULT NULL COMMENT '设备信息',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '操作时间（毫秒精度）',
  PRIMARY KEY (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
