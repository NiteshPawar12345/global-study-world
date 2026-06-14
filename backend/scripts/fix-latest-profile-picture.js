const { Consultant } = require('../models');
const { sequelize } = require('../config/database');

async function fixLatestProfilePicture() {
  try {
    console.log('🔄 Fixing latest profile picture filename...');
    
    // Get consultant with ID 8 (FUSION)
    const consultant = await Consultant.findByPk(8);
    
    if (!consultant) {
      console.log('❌ Consultant not found');
      return;
    }
    
    console.log('📊 Found consultant:', consultant.agency_name);
    console.log('Current profile_picture:', consultant.profile_picture);
    
    // The correct filename should include the .jpg extension
    const correctFilename = 'profile_picture-1761717614639-52977558.jpg';
    
    if (consultant.profile_picture !== correctFilename) {
      await consultant.update({
        profile_picture: correctFilename
      });
      console.log('✅ Updated profile_picture to:', correctFilename);
      
      // Verify the fix
      const updatedConsultant = await Consultant.findByPk(8);
      console.log('Updated profile_picture:', updatedConsultant.profile_picture);
    } else {
      console.log('ℹ️ Profile picture filename is already correct');
    }
    
    console.log('🎉 Profile picture filename fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run fix if called directly
if (require.main === module) {
  fixLatestProfilePicture();
}

module.exports = fixLatestProfilePicture;



