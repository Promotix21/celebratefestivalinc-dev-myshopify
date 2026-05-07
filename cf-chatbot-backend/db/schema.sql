CREATE TABLE IF NOT EXISTS products_index (
  id BIGINT UNSIGNED PRIMARY KEY,
  shopify_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(500) NOT NULL,
  handle VARCHAR(500) NOT NULL,
  description TEXT,
  vendor VARCHAR(255),
  product_type VARCHAR(255),
  tags TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  available TINYINT(1) DEFAULT 1,
  url VARCHAR(1000),
  image_url VARCHAR(1000),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_handle (handle),
  INDEX idx_vendor (vendor),
  INDEX idx_product_type (product_type),
  FULLTEXT idx_search (title, description, tags, vendor, product_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(128) NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  message_count INT DEFAULT 0,
  lead_captured TINYINT(1) DEFAULT 0,
  blocked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chat_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  role ENUM('user','assistant','system') NOT NULL,
  content TEXT NOT NULL,
  intent VARCHAR(50),
  result_count INT DEFAULT 0,
  tokens_in INT DEFAULT 0,
  tokens_out INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_intent (intent),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64),
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  source VARCHAR(50) DEFAULT 'chatbot',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rate_limits (
  session_id VARCHAR(64) NOT NULL,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  request_count INT DEFAULT 1,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- === 3-mode enhancement (Phase A) ===
-- Additive ALTERs below are tolerated as no-ops on re-run by db/migrate.js
-- (errors 1060 duplicate-column, 1061 duplicate-key are swallowed).

ALTER TABLE products_index ADD COLUMN default_sku VARCHAR(120) NULL;
ALTER TABLE products_index ADD COLUMN has_multiple_variants TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE products_index ADD COLUMN variant_count SMALLINT UNSIGNED NOT NULL DEFAULT 1;
ALTER TABLE products_index ADD INDEX idx_default_sku (default_sku);

CREATE TABLE IF NOT EXISTS variants_index (
  id BIGINT UNSIGNED PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  sku VARCHAR(120) NOT NULL,
  title VARCHAR(500),
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  available TINYINT(1) DEFAULT 1,
  inventory_quantity INT DEFAULT 0,
  option1 VARCHAR(255),
  option2 VARCHAR(255),
  option3 VARCHAR(255),
  barcode VARCHAR(120),
  image_url VARCHAR(1000),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_variant_sku (sku),
  INDEX idx_variant_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE sessions ADD COLUMN mode ENUM('discovery','consultation','pro') NOT NULL DEFAULT 'discovery';
ALTER TABLE sessions ADD COLUMN mode_context JSON NULL;
ALTER TABLE sessions ADD COLUMN mode_locked_at TIMESTAMP NULL;
ALTER TABLE sessions ADD COLUMN customer_tags JSON NULL;
ALTER TABLE sessions ADD COLUMN is_premium TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE sessions ADD COLUMN tags_verified_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS consultations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  cuisine VARCHAR(100),
  service_type VARCHAR(100),
  location VARCHAR(255),
  budget VARCHAR(100),
  status ENUM('in_progress','summary_sent','booked','abandoned') NOT NULL DEFAULT 'in_progress',
  lead_id BIGINT UNSIGNED NULL,
  booking_slot_start DATETIME NULL,
  booking_slot_end DATETIME NULL,
  calendar_event_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_consult_session (session_id),
  INDEX idx_consult_status (status),
  INDEX idx_consult_slot (booking_slot_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pro_orders_draft (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  customer_id VARCHAR(128) NULL,
  items JSON NOT NULL,
  total_cents BIGINT NOT NULL DEFAULT 0,
  added_to_cart TINYINT(1) NOT NULL DEFAULT 0,
  checked_out TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_draft_session (session_id),
  INDEX idx_draft_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- === Analytics + cost tracking (Phase J/K) ===

CREATE TABLE IF NOT EXISTS cost_ledger (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  chat_log_id BIGINT UNSIGNED NULL,
  model VARCHAR(64) NOT NULL,
  tokens_in INT NOT NULL DEFAULT 0,
  tokens_out INT NOT NULL DEFAULT 0,
  cost_usd DECIMAL(18,8) NOT NULL DEFAULT 0,
  mode ENUM('discovery','consultation','pro') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cost_session (session_id),
  INDEX idx_cost_created (created_at),
  INDEX idx_cost_model (model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS daily_stats (
  stat_date DATE PRIMARY KEY,
  sessions_total INT NOT NULL DEFAULT 0,
  messages_total INT NOT NULL DEFAULT 0,
  llm_calls INT NOT NULL DEFAULT 0,
  tokens_in BIGINT NOT NULL DEFAULT 0,
  tokens_out BIGINT NOT NULL DEFAULT 0,
  cost_usd DECIMAL(18,8) NOT NULL DEFAULT 0,
  discovery_msgs INT NOT NULL DEFAULT 0,
  consultation_msgs INT NOT NULL DEFAULT 0,
  pro_msgs INT NOT NULL DEFAULT 0,
  zero_result_queries INT NOT NULL DEFAULT 0,
  leads_captured INT NOT NULL DEFAULT 0,
  consultations_booked INT NOT NULL DEFAULT 0,
  pro_drafts INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- === Admin authentication (Phase N1) ===

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NULL,
  email VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  csrf_token CHAR(48) NOT NULL,
  user_agent VARCHAR(500) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  INDEX idx_admin_session_user (user_id),
  INDEX idx_admin_session_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NULL,
  ip_address VARCHAR(45) NOT NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  reason VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attempt_ip (ip_address, created_at),
  INDEX idx_attempt_user (username, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_captchas (
  captcha_id CHAR(32) PRIMARY KEY,
  answer_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  consumed TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_captcha_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
