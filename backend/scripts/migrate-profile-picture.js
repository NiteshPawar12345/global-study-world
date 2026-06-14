const { Consultant } = require('../models');
const { sequelize } = require('../config/database');

async function migrateProfilePicture() {
  try {
    console.log('🔄 Starting profile picture migration...');
    
    // Check if profile_picture column exists
    const tableDescription = await sequelize.getQueryInterface().describeTable('consultants');
    
    if (!tableDescription.profile_picture) {
      console.log('❌ profile_picture column does not exist. Please run database migration first.');
      return;
    }
    
    // Check if logo column still exists
    const tableDesc = await sequelize.getQueryInterface().describeTable('consultants');
    
    if (tableDesc.logo) {
      // Get all consultants with logo field
      const consultants = await Consultant.findAll({
        where: {
          logo: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      });
      
      console.log(`📊 Found ${consultants.length} consultants with logo to migrate`);
      
      // Migrate logo to profile_picture
      for (const consultant of consultants) {
        await consultant.update({
          profile_picture: consultant.logo,
          logo: null
        });
        console.log(`✅ Migrated consultant ${consultant.id}: ${consultant.agency_name}`);
      }
    } else {
      console.log('ℹ️ Logo column no longer exists - migration already completed by table migration script');
    }
    
    console.log('🎉 Profile picture migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateProfilePicture();
}

module.exports = migrateProfilePicture;
