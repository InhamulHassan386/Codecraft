CREATE DATABASE IF NOT EXISTS codecraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codecraft;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(180) NOT NULL UNIQUE, title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL, content LONGTEXT NULL, category VARCHAR(80) NOT NULL, date VARCHAR(40) NOT NULL,
  read_time VARCHAR(40) NOT NULL, image TEXT NOT NULL, author VARCHAR(120) NOT NULL, author_role VARCHAR(120) NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE, published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(180) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL, description TEXT NOT NULL, long_description LONGTEXT NOT NULL, image MEDIUMTEXT NOT NULL,
  technologies JSON NOT NULL, results JSON NOT NULL, year VARCHAR(10) NOT NULL, client VARCHAR(180) NOT NULL,
  duration VARCHAR(80) NOT NULL, published BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(180) NOT NULL UNIQUE, icon VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL, tagline VARCHAR(255) NOT NULL, description TEXT NOT NULL, features JSON NOT NULL,
  benefits JSON NOT NULL, technologies JSON NOT NULL, deliverables JSON NOT NULL, published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, role VARCHAR(180) NOT NULL, bio TEXT NOT NULL,
  skills JSON NOT NULL, image TEXT NOT NULL, location VARCHAR(120) NOT NULL, published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, company VARCHAR(180) NOT NULL,
  role VARCHAR(120) NOT NULL, review TEXT NOT NULL, rating TINYINT UNSIGNED NOT NULL DEFAULT 5, image TEXT NOT NULL,
  published BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS jobs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, job_key VARCHAR(120) NOT NULL UNIQUE, title VARCHAR(180) NOT NULL,
  department VARCHAR(120) NOT NULL, location VARCHAR(120) NOT NULL, type VARCHAR(80) NOT NULL, experience VARCHAR(80) NOT NULL,
  skills JSON NOT NULL, description TEXT NOT NULL, responsibilities JSON NOT NULL, posted VARCHAR(40) NOT NULL,
  published BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL, message TEXT NOT NULL, service VARCHAR(120) NULL, status ENUM('New','Read','Replied') DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quote_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, email VARCHAR(255) NOT NULL,
  company VARCHAR(180) NULL, service VARCHAR(120) NOT NULL, budget VARCHAR(80) NULL, details TEXT NULL,
  status ENUM('Pending','Contacted','Quoted','Accepted','Rejected') DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS job_applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, job_id INT UNSIGNED NULL, name VARCHAR(160) NOT NULL, email VARCHAR(255) NOT NULL,
  resume_url TEXT NULL, message TEXT NULL, status ENUM('New','Shortlisted','Interview','Rejected','Hired') DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE, last_login TIMESTAMP NULL, role ENUM('Super Admin','Editor','Viewer') DEFAULT 'Editor', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(120) PRIMARY KEY, setting_value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Starter portfolio projects (safe to re-run because slugs are unique)
INSERT IGNORE INTO projects (slug, name, category, description, long_description, image, technologies, results, year, client, duration, published) VALUES
('finflow-banking-platform', 'FinFlow Banking Platform', 'Fintech', 'A secure digital banking platform for modern financial teams.', 'FinFlow brings accounts, payments, reporting and team approvals into one fast, accessible workspace.', 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=1200', '["React", "Node.js", "MySQL"]', '["42% faster workflows", "99.9% uptime"]', '2026', 'FinFlow', '14 weeks', TRUE),
('shopnest-ecommerce', 'ShopNest E-Commerce', 'E-Commerce', 'A conversion-focused online store with a smooth checkout experience.', 'ShopNest helps a growing retail brand manage products, orders and customer journeys from one platform.', 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200', '["React", "Express", "MySQL"]', '["2.4x more conversions", "35% lower bounce rate"]', '2026', 'ShopNest', '12 weeks', TRUE),
('careconnect-health', 'CareConnect Health Portal', 'Healthcare', 'A patient portal that makes appointments and care updates simple.', 'CareConnect gives patients and medical teams a clear, secure way to manage appointments, records and follow-ups.', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1200', '["TypeScript", "Node.js", "MySQL"]', '["60% fewer support calls", "4.8/5 patient rating"]', '2025', 'CareConnect', '16 weeks', TRUE),
('fleetwise-logistics', 'FleetWise Logistics', 'Logistics', 'Real-time fleet operations software for growing delivery teams.', 'FleetWise connects dispatchers, drivers and managers with live delivery tracking and performance insights.', 'https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=1200', '["React", "Express", "MySQL"]', '["28% faster dispatch", "18% fuel savings"]', '2025', 'FleetWise', '18 weeks', TRUE);

CREATE TABLE IF NOT EXISTS revenue_records (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, label VARCHAR(30) NOT NULL, amount DECIMAL(12,2) NOT NULL, recorded_at DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO revenue_records (label, amount, recorded_at) VALUES ("Jan",42000,"2026-01-31"),("Feb",58000,"2026-02-28"),("Mar",45000,"2026-03-31"),("Apr",70000,"2026-04-30"),("May",62000,"2026-05-31"),("Jun",84000,"2026-06-30"),("Jul",76000,"2026-07-31"),("Aug",92000,"2026-08-31"),("Sep",88000,"2026-09-30"),("Oct",104000,"2026-10-31"),("Nov",98000,"2026-11-30"),("Dec",120000,"2026-12-31");

ALTER TABLE projects MODIFY image MEDIUMTEXT NOT NULL;
