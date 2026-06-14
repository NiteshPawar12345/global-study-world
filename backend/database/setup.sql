-- Global Education Database Setup
-- This file contains all the SQL queries to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS global_education;
USE global_education;

-- Create user for the application
CREATE USER IF NOT EXISTS 'global_edu_user'@'localhost' IDENTIFIED BY 'GlobalEdu@2024!';
CREATE USER IF NOT EXISTS 'global_edu_user'@'%' IDENTIFIED BY 'GlobalEdu@2024!';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON global_education.* TO 'global_edu_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON global_education.* TO 'global_edu_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Create tables
-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    location VARCHAR(255),
    country VARCHAR(100),
    date_of_birth DATE,
    profile_image VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_created_at (created_at)
);

-- Consultants table
CREATE TABLE IF NOT EXISTS consultants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agency_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    website VARCHAR(500),
    logo VARCHAR(500),
    banner_image VARCHAR(500),
    description TEXT,
    experience_years INT,
    total_placements INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    response_time_hours INT DEFAULT 24,
    fee_min DECIMAL(10,2),
    fee_max DECIMAL(10,2),
    fee_model ENUM('fixed', 'percentage') DEFAULT 'fixed',
    location VARCHAR(255),
    languages JSON,
    gst_number VARCHAR(50),
    bank_details JSON,
    nda_accepted BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'suspended', 'rejected') DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_verified (is_verified),
    INDEX idx_created_at (created_at)
);

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL,
    flag_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultant countries (many-to-many relationship)
CREATE TABLE IF NOT EXISTS consultant_countries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    consultant_id INT NOT NULL,
    country_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_consultant_country (consultant_id, country_id)
);

-- Consultant courses (many-to-many relationship)
CREATE TABLE IF NOT EXISTS consultant_courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    consultant_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_consultant_course (consultant_id, course_id)
);

-- Student inquiries table
CREATE TABLE IF NOT EXISTS student_inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    consultant_id INT,
    requested_consultant_id INT,
    country_preference VARCHAR(100),
    course_preference VARCHAR(255),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    timeline VARCHAR(100),
    additional_requirements TEXT,
    status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE SET NULL,
    FOREIGN KEY (requested_consultant_id) REFERENCES consultants(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_requested_consultant_id (requested_consultant_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    consultant_id INT NOT NULL,
    inquiry_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (inquiry_id) REFERENCES student_inquiries(id) ON DELETE SET NULL,
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    consultant_id INT NOT NULL,
    last_message_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participants (student_id, consultant_id),
    INDEX idx_student_id (student_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_last_message (last_message_at)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_type ENUM('student', 'consultant') NOT NULL,
    sender_id INT NOT NULL,
    content TEXT,
    metadata JSON,
    read_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_read_status (read_at),
    INDEX idx_sender_type (sender_type)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    consultant_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    total_leads INT DEFAULT 0,
    completed_leads INT DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL,
    total_commission DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date TIMESTAMP NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    INDEX idx_month_year (month, year),
    INDEX idx_due_date (due_date)
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    inquiry_id INT NOT NULL,
    student_name VARCHAR(255),
    course VARCHAR(255),
    country VARCHAR(100),
    consultant_fee DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (inquiry_id) REFERENCES student_inquiries(id) ON DELETE CASCADE
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500) NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    user_type ENUM('student', 'consultant', 'admin') NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert default countries
INSERT IGNORE INTO countries (name, code) VALUES
('United States', 'USA'),
('Canada', 'CAN'),
('United Kingdom', 'GBR'),
('Australia', 'AUS'),
('Germany', 'DEU'),
('Ireland', 'IRL'),
('Netherlands', 'NLD'),
('France', 'FRA'),
('Spain', 'ESP'),
('Italy', 'ITA'),
('New Zealand', 'NZL'),
('Sweden', 'SWE'),
('Norway', 'NOR'),
('Denmark', 'DNK'),
('Finland', 'FIN'),
('Switzerland', 'CHE'),
('Austria', 'AUT'),
('Belgium', 'BEL'),
('Japan', 'JPN'),
('South Korea', 'KOR'),
('Singapore', 'SGP'),
('Malaysia', 'MYS'),
('Thailand', 'THA'),
('China', 'CHN'),
('India', 'IND');

-- Insert default courses
INSERT IGNORE INTO courses (name, category) VALUES
('Computer Science', 'Technology'),
('Information Technology', 'Technology'),
('Software Engineering', 'Technology'),
('Data Science', 'Technology'),
('Artificial Intelligence', 'Technology'),
('Cybersecurity', 'Technology'),
('Business Administration', 'Business'),
('MBA', 'Business'),
('Finance', 'Business'),
('Marketing', 'Business'),
('International Business', 'Business'),
('Economics', 'Business'),
('Mechanical Engineering', 'Engineering'),
('Civil Engineering', 'Engineering'),
('Electrical Engineering', 'Engineering'),
('Chemical Engineering', 'Engineering'),
('Biomedical Engineering', 'Engineering'),
('Medicine', 'Healthcare'),
('Nursing', 'Healthcare'),
('Pharmacy', 'Healthcare'),
('Dentistry', 'Healthcare'),
('Psychology', 'Healthcare'),
('Public Health', 'Healthcare'),
('Law', 'Law'),
('International Law', 'Law'),
('Criminal Law', 'Law'),
('Arts', 'Arts'),
('Design', 'Arts'),
('Fashion Design', 'Arts'),
('Graphic Design', 'Arts'),
('Architecture', 'Arts'),
('Music', 'Arts'),
('Film Studies', 'Arts'),
('Journalism', 'Media'),
('Mass Communication', 'Media'),
('Digital Marketing', 'Media'),
('Education', 'Education'),
('Teaching', 'Education'),
('Special Education', 'Education'),
('Environmental Science', 'Science'),
('Biology', 'Science'),
('Chemistry', 'Science'),
('Physics', 'Science'),
('Mathematics', 'Science'),
('Statistics', 'Science');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO admin_users (username, email, password_hash, role, is_verified) VALUES
('admin', 'admin@globaleducation.in', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'super_admin', TRUE);

-- Insert default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('commission_rate', '15', 'Default commission rate percentage'),
('max_consultants_per_lead', '5', 'Maximum number of consultants to assign per lead'),
('lead_response_time_hours', '24', 'Expected response time for consultants in hours'),
('featured_listing_price', '2000', 'Monthly price for featured consultant listing'),
('site_name', 'Global Education', 'Website name'),
('site_email', 'info@globaleducation.in', 'Default site email'),
('site_phone', '+91 98765 43210', 'Default site phone number'),
('currency', 'INR', 'Default currency'),
('timezone', 'Asia/Kolkata', 'Default timezone');

