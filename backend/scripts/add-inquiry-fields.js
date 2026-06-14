const mysql = require('mysql2/promise');
require('dotenv').config();

const addInquiryFields = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'global_education'
    });

    console.log('Connected to database');

    // Add new columns to student_inquiries table
    const alterQueries = [
      "ALTER TABLE student_inquiries ADD COLUMN IF NOT EXISTS current_education VARCHAR(100) NULL AFTER additional_requirements",
      "ALTER TABLE student_inquiries ADD COLUMN IF NOT EXISTS english_proficiency VARCHAR(100) NULL AFTER current_education",
      "ALTER TABLE student_inquiries ADD COLUMN IF NOT EXISTS work_experience VARCHAR(50) NULL AFTER english_proficiency"
    ];

    for (const query of alterQueries) {
      try {
        // MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so we'll use a different approach
        await connection.execute(query.replace('IF NOT EXISTS', ''));
        console.log('✓ Column added successfully');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('✓ Column already exists, skipping...');
        } else {
          throw error;
        }
      }
    }

    // Try alternative syntax for MySQL
    for (const field of [
      { name: 'current_education', type: 'VARCHAR(100)' },
      { name: 'english_proficiency', type: 'VARCHAR(100)' },
      { name: 'work_experience', type: 'VARCHAR(50)' }
    ]) {
      try {
        await connection.execute(`
          ALTER TABLE student_inquiries 
          ADD COLUMN ${field.name} ${field.type} NULL 
          AFTER additional_requirements
        `);
        console.log(`✓ Added column: ${field.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`✓ Column ${field.name} already exists`);
        } else {
          console.error(`Error adding ${field.name}:`, error.message);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run migration
addInquiryFields()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });



