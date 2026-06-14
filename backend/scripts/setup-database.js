const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;
  
  try {
    console.log('🚀 Starting database setup...');
    
    // Connect to MySQL as root (or with admin privileges)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: 'root', // Use root for initial setup
      password: process.env.DB_ROOT_PASSWORD || '', // Add this to your .env
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Read and execute setup.sql
    const setupSQL = fs.readFileSync(path.join(__dirname, '../database/setup.sql'), 'utf8');
    console.log('📄 Executing database setup script...');
    await connection.execute(setupSQL);
    console.log('✅ Database structure created');

    // Read and execute user_setup.sql
    const userSetupSQL = fs.readFileSync(path.join(__dirname, '../database/user_setup.sql'), 'utf8');
    console.log('👤 Setting up database users...');
    await connection.execute(userSetupSQL);
    console.log('✅ Database users created');

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the correct database credentials');
    console.log('2. Run: npm run dev');
    console.log('3. The application will automatically sync the database models');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Manual setup instructions:');
    console.log('1. Login to MySQL as root: mysql -u root -p');
    console.log('2. Run: source database/setup.sql');
    console.log('3. Run: source database/user_setup.sql');
    console.log('4. Update your .env file with the correct credentials');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;








