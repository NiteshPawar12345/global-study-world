-- Global Education Database User Setup
-- This file creates the database user and grants necessary permissions

-- Create the main application user
CREATE USER IF NOT EXISTS 'global_edu_user'@'localhost' IDENTIFIED BY 'GlobalEdu@2024!';
CREATE USER IF NOT EXISTS 'global_edu_user'@'%' IDENTIFIED BY 'GlobalEdu@2024!';

-- Grant all necessary permissions on the global_education database
GRANT SELECT, INSERT, UPDATE, DELETE ON global_education.* TO 'global_edu_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON global_education.* TO 'global_edu_user'@'%';

-- Grant additional permissions for table management
GRANT CREATE, DROP, INDEX, ALTER ON global_education.* TO 'global_edu_user'@'localhost';
GRANT CREATE, DROP, INDEX, ALTER ON global_education.* TO 'global_edu_user'@'%';

-- Grant permissions for stored procedures and functions (if needed)
GRANT EXECUTE ON global_education.* TO 'global_edu_user'@'localhost';
GRANT EXECUTE ON global_education.* TO 'global_edu_user'@'%';

-- Grant permissions for triggers (if needed)
GRANT TRIGGER ON global_education.* TO 'global_edu_user'@'localhost';
GRANT TRIGGER ON global_education.* TO 'global_edu_user'@'%';

-- Create a read-only user for reporting and analytics
CREATE USER IF NOT EXISTS 'global_edu_readonly'@'localhost' IDENTIFIED BY 'ReadOnly@2024!';
CREATE USER IF NOT EXISTS 'global_edu_readonly'@'%' IDENTIFIED BY 'ReadOnly@2024!';

-- Grant read-only permissions
GRANT SELECT ON global_education.* TO 'global_edu_readonly'@'localhost';
GRANT SELECT ON global_education.* TO 'global_edu_readonly'@'%';

-- Create a backup user with limited permissions
CREATE USER IF NOT EXISTS 'global_edu_backup'@'localhost' IDENTIFIED BY 'Backup@2024!';
CREATE USER IF NOT EXISTS 'global_edu_backup'@'%' IDENTIFIED BY 'Backup@2024!';

-- Grant backup permissions
GRANT SELECT, LOCK TABLES ON global_education.* TO 'global_edu_backup'@'localhost';
GRANT SELECT, LOCK TABLES ON global_education.* TO 'global_edu_backup'@'%';

-- Flush privileges to ensure all changes take effect
FLUSH PRIVILEGES;

-- Show created users
SELECT User, Host FROM mysql.user WHERE User LIKE 'global_edu%';

-- Show grants for the main user
SHOW GRANTS FOR 'global_edu_user'@'localhost';
SHOW GRANTS FOR 'global_edu_user'@'%';








