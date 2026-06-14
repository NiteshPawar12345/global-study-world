const { sequelize } = require('../config/database');

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration results...');
    
    const tableDescription = await sequelize.getQueryInterface().describeTable('consultants');
    
    console.log('\n📋 Current consultant table columns:');
    Object.keys(tableDescription).forEach(col => {
      console.log(`- ${col}: ${tableDescription[col].type}`);
    });
    
    // Check if profile_picture exists and banner_image/logo are removed
    const hasProfilePicture = !!tableDescription.profile_picture;
    const hasBannerImage = !!tableDescription.banner_image;
    const hasLogo = !!tableDescription.logo;
    
    console.log('\n✅ Migration Status:');
    console.log(`- profile_picture column: ${hasProfilePicture ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- banner_image column: ${hasBannerImage ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`- logo column: ${hasLogo ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    
    if (hasProfilePicture && !hasBannerImage && !hasLogo) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️ Migration may not be complete. Please check the results above.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await sequelize.close();
  }
}

verifyMigration();
