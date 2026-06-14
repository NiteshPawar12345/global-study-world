const { sequelize } = require('../config/database');

async function migrateConsultantTable() {
  try {
    console.log('🔄 Starting consultant table migration...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if profile_picture column exists
    const tableDescription = await queryInterface.describeTable('consultants');
    
    if (!tableDescription.profile_picture) {
      console.log('📝 Adding profile_picture column...');
      await queryInterface.addColumn('consultants', 'profile_picture', {
        type: sequelize.Sequelize.STRING(500),
        allowNull: true
      });
      console.log('✅ profile_picture column added');
    } else {
      console.log('ℹ️ profile_picture column already exists');
    }
    
    // Check if banner_image column exists and remove it
    if (tableDescription.banner_image) {
      console.log('📝 Removing banner_image column...');
      await queryInterface.removeColumn('consultants', 'banner_image');
      console.log('✅ banner_image column removed');
    } else {
      console.log('ℹ️ banner_image column does not exist');
    }
    
    // Migrate existing logo data to profile_picture
    if (tableDescription.logo) {
      console.log('📝 Migrating logo data to profile_picture...');
      await sequelize.query(`
        UPDATE consultants 
        SET profile_picture = logo 
        WHERE logo IS NOT NULL AND profile_picture IS NULL
      `);
      console.log('✅ Logo data migrated to profile_picture');
      
      // Remove logo column
      console.log('📝 Removing logo column...');
      await queryInterface.removeColumn('consultants', 'logo');
      console.log('✅ logo column removed');
    } else {
      console.log('ℹ️ logo column does not exist');
    }
    
    console.log('🎉 Consultant table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateConsultantTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateConsultantTable;



