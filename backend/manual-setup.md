# Manual Database Setup Guide

## Step 1: Install and Start MySQL

1. **Install MySQL** (if not already installed):
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP which includes MySQL

2. **Start MySQL service**

## Step 2: Create Database and User

Open MySQL command line or MySQL Workbench and run:

```sql
-- Connect as root
mysql -u root -p

-- Create database
CREATE DATABASE global_education;

-- Create user
CREATE USER 'global_edu_user'@'localhost' IDENTIFIED BY 'GlobalEdu@2024!';

-- Grant permissions
GRANT ALL PRIVILEGES ON global_education.* TO 'global_edu_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE global_education;
```

## Step 3: Create Tables

Run the setup script:

```bash
# From the backend directory
mysql -u global_edu_user -p global_education < database/setup.sql
```

Or copy and paste the contents of `database/setup.sql` into MySQL Workbench.

## Step 4: Verify Setup

```sql
-- Check if tables were created
SHOW TABLES;

-- Check admin user
SELECT * FROM admin_users;

-- Check countries
SELECT COUNT(*) FROM countries;

-- Check courses
SELECT COUNT(*) FROM courses;
```

## Step 5: Start the Application

```bash
# Start backend
npm run dev

# In another terminal, start frontend
cd ../frontend
npm run dev
```

## Default Admin Credentials

- **Username**: admin
- **Email**: admin@globaleducation.in
- **Password**: admin123

## Troubleshooting

1. **MySQL not running**: Start MySQL service
2. **Access denied**: Check username/password
3. **Database exists**: Drop and recreate if needed
4. **Port issues**: Check if port 3306 is available

## Alternative: Use XAMPP

1. Install XAMPP
2. Start Apache and MySQL from XAMPP Control Panel
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create database `global_education`
5. Import the `database/setup.sql` file







