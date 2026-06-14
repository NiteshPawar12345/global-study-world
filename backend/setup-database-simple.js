const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Starting database setup...');
    
    // First, connect as root to create database and user
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: 'root', // Connect as root first
      password: process.env.DB_ROOT_PASSWORD || '', // You might need to set this
    });

    console.log('✅ Connected to MySQL server as root');

    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS global_education');
    console.log('✅ Database created');

    // Create user (this might fail if user already exists, that's ok)
    try {
      await connection.execute(`CREATE USER IF NOT EXISTS 'global_edu_user'@'localhost' IDENTIFIED BY 'GlobalEdu@2024!'`);
      await connection.execute(`CREATE USER IF NOT EXISTS 'global_edu_user'@'%' IDENTIFIED BY 'GlobalEdu@2024!'`);
      console.log('✅ Database user created');
    } catch (error) {
      console.log('⚠️  User might already exist, continuing...');
    }

    // Grant permissions
    await connection.execute('GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON global_education.* TO \'global_edu_user\'@\'localhost\'');
    await connection.execute('GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON global_education.* TO \'global_edu_user\'@\'%\'');
    await connection.execute('FLUSH PRIVILEGES');
    console.log('✅ Permissions granted');

    // Close root connection
    await connection.end();

    // Now connect as the application user to create tables
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: 'global_edu_user',
      password: 'GlobalEdu@2024!',
      database: 'global_education'
    });

    console.log('✅ Connected as application user');

    // Read the SQL setup file
    const sqlFile = path.join(__dirname, 'database', 'setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.toLowerCase().includes('create database') && !stmt.toLowerCase().includes('create user') && !stmt.toLowerCase().includes('grant') && !stmt.toLowerCase().includes('flush privileges'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Skip errors for statements that might already exist
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
              error.code === 'ER_DB_CREATE_EXISTS' ||
              error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Skipped statement ${i + 1} (already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
            throw error;
          }
        }
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Database Information:');
    console.log(`   Database: global_education`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   User: global_edu_user`);
    console.log('\n👤 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@globaleducation.in');
    console.log('   Password: admin123');
    console.log('\n🔧 Next Steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check if you have root access to MySQL');
    console.log('   3. You might need to set DB_ROOT_PASSWORD in your .env file');
    console.log('   4. Or run MySQL commands manually:');
    console.log('      mysql -u root -p');
    console.log('      CREATE DATABASE global_education;');
    console.log('      CREATE USER \'global_edu_user\'@\'localhost\' IDENTIFIED BY \'GlobalEdu@2024!\';');
    console.log('      GRANT ALL PRIVILEGES ON global_education.* TO \'global_edu_user\'@\'localhost\';');
    console.log('      FLUSH PRIVILEGES;');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase();







