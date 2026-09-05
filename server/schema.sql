-- Schema for Simple Expense Tracker
-- Compatible with MySQL 8.x / Aiven MySQL

-- Exactly 2 tables: categories and expenses

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed exactly 5 categories
INSERT INTO categories (id, name) VALUES
  (1, 'Food'),
  (2, 'Transport'),
  (3, 'Shopping'),
  (4, 'Bills'),
  (5, 'Other')
ON DUPLICATE KEY UPDATE name=VALUES(name);
