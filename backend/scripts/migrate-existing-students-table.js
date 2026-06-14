const { sequelize } = require('../config/database');

async function migrateStudentsTable() {
  try {
    console.log('Starting students table migration...');
    
    // Check if the table exists and get its current structure
    const [results] = await sequelize.query('DESCRIBE students');
    console.log('Current table structure:', results.map(r => r.Field));
    
    // Add new columns if they don't exist
    const newColumns = [
      { name: 'first_name', type: 'VARCHAR(100)', after: 'id' },
      { name: 'last_name', type: 'VARCHAR(100)', after: 'first_name' },
      { name: 'mobile', type: 'VARCHAR(20)', after: 'last_name' },
      { name: 'gender', type: "ENUM('male', 'female', 'other')", after: 'date_of_birth' },
      { name: 'current_education', type: 'VARCHAR(255)', after: 'gender' },
      { name: 'interested_countries', type: 'JSON', after: 'current_education' },
      { name: 'interested_courses', type: 'JSON', after: 'interested_countries' },
      { name: 'budget_range', type: 'VARCHAR(50)', after: 'interested_courses' },
      { name: 'preferred_intake', type: 'VARCHAR(50)', after: 'budget_range' },
      { name: 'status', type: "ENUM('active', 'inactive', 'suspended')", after: 'preferred_intake' },
      { name: 'email_verified', type: 'BOOLEAN', after: 'status' },
      { name: 'mobile_verified', type: 'BOOLEAN', after: 'email_verified' },
      { name: 'last_login', type: 'DATETIME', after: 'mobile_verified' }
    ];
    
    const existingColumns = results.map(r => r.Field);
    
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await sequelize.query(`ALTER TABLE students ADD COLUMN ${column.name} ${column.type} AFTER ${column.after}`);
      } else {
        console.log(`Column ${column.name} already exists`);
      }
    }
    
    // Migrate data from existing columns to new columns
    console.log('Migrating existing data...');
    
    // Split name into first_name and last_name
    await sequelize.query(`
      UPDATE students 
      SET first_name = SUBSTRING_INDEX(name, ' ', 1),
          last_name = CASE 
            WHEN LOCATE(' ', name) > 0 THEN SUBSTRING(name, LOCATE(' ', name) + 1)
            ELSE ''
          END
      WHERE first_name IS NULL OR first_name = ''
    `);
    
    // Copy phone to mobile
    await sequelize.query(`
      UPDATE students 
      SET mobile = phone 
      WHERE mobile IS NULL OR mobile = ''
    `);
    
    // Set default values for new columns
    await sequelize.query(`
      UPDATE students 
      SET status = 'active',
          email_verified = COALESCE(is_verified, false),
          mobile_verified = false,
          interested_countries = JSON_ARRAY(),
          interested_courses = JSON_ARRAY()
      WHERE status IS NULL
    `);
    
    // Add indexes for better performance
    console.log('Adding indexes...');
    try {
      await sequelize.query('CREATE INDEX idx_students_mobile ON students(mobile)');
    } catch (e) {
      console.log('Mobile index already exists or failed to create');
    }
    
    try {
      await sequelize.query('CREATE INDEX idx_students_status ON students(status)');
    } catch (e) {
      console.log('Status index already exists or failed to create');
    }
    
    console.log('Students table migration completed successfully!');
    
  } catch (error) {
    console.error('Error during students table migration:', error);
    throw error;
  }
}

async function main() {
  try {
    await migrateStudentsTable();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateStudentsTable };



