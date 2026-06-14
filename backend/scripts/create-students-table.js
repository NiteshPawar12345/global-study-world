const { sequelize } = require('../config/database');

async function createStudentsTable() {
  try {
    console.log('Creating students table...');
    
    // Check if table already exists
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    if (tableExists.includes('students')) {
      console.log('Students table already exists. Skipping creation.');
      return;
    }

    // Create students table
    await sequelize.getQueryInterface().createTable('students', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: {
        type: sequelize.Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: sequelize.Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      mobile: {
        type: sequelize.Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: false
      },
      date_of_birth: {
        type: sequelize.Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: sequelize.Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      current_education: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: true
      },
      interested_countries: {
        type: sequelize.Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      interested_courses: {
        type: sequelize.Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      budget_range: {
        type: sequelize.Sequelize.STRING(50),
        allowNull: true
      },
      preferred_intake: {
        type: sequelize.Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: sequelize.Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
      },
      email_verified: {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false
      },
      mobile_verified: {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_login: {
        type: sequelize.Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.NOW
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.NOW
      }
    });

    console.log('Students table created successfully!');
    
    // Add indexes for better performance
    await sequelize.getQueryInterface().addIndex('students', ['email']);
    await sequelize.getQueryInterface().addIndex('students', ['mobile']);
    await sequelize.getQueryInterface().addIndex('students', ['status']);
    
    console.log('Indexes added successfully!');
    
  } catch (error) {
    console.error('Error creating students table:', error);
    throw error;
  }
}

async function main() {
  try {
    await createStudentsTable();
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

module.exports = { createStudentsTable };



