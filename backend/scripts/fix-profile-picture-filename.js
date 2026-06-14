const { Consultant } = require('../models');
const { sequelize } = require('../config/database');

async function fixProfilePictureFilenames() {
  try {
    console.log('🔄 Fixing profile picture filenames...');
    
    // Get consultant with ID 8 (FUSION)
    const consultant = await Consultant.findByPk(8);
    
    if (!consultant) {
      console.log('❌ Consultant not found');
      return;
    }
    
    console.log('📊 Found consultant:', consultant.agency_name);
    console.log('Current profile_picture:', consultant.profile_picture);
    
    // The actual filename in the filesystem includes the full extension
    const correctFilename = 'profile_picture-1761716948104-577657562.jpg';
    
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
  fixProfilePictureFilenames();
}

module.exports = fixProfilePictureFilenames;



