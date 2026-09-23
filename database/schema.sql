CREATE DATABASE IF NOT EXISTS library_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_system;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  member_id VARCHAR(40) NOT NULL UNIQUE,
  nic VARCHAR(30) NULL,
  phone VARCHAR(30) NULL,
  branch VARCHAR(100) NULL,
  joined_date DATE NOT NULL,
  borrowed_count INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS books (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(180) NOT NULL,
  isbn VARCHAR(40) NULL UNIQUE,
  publisher VARCHAR(180) NULL,
  category VARCHAR(100) NULL,
  year_published YEAR NULL,
  pages INT UNSIGNED NULL,
  total_copies INT UNSIGNED NOT NULL DEFAULT 1,
  available_copies INT UNSIGNED NOT NULL DEFAULT 1,
  cover_image VARCHAR(500) NULL,
  synopsis TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(50) NOT NULL UNIQUE,
  member_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  reservation_date DATE NOT NULL,
  status ENUM('pending','approved','declined') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS borrowings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  member_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  borrowed_at DATE NOT NULL,
  due_date DATE NOT NULL,
  returned_at DATE NULL,
  status ENUM('borrowed','returned','overdue') NOT NULL DEFAULT 'borrowed',
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS branches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  address VARCHAR(255) NULL,
  phone VARCHAR(40) NULL
);

INSERT IGNORE INTO branches(name) VALUES
('Colombo Central'),('Kandy Branch'),('Galle Branch'),('Jaffna Branch'),
('Matara Branch'),('Kurunegala Branch'),('Anuradhapura Branch'),('Badulla Branch');

-- Create an admin password with PHP password_hash() before inserting an admin user.
-- Example PHP: echo password_hash('YOUR_PASSWORD', PASSWORD_DEFAULT);
