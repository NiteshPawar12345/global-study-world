const { Consultant } = require('../models');
const { sequelize } = require('../config/database');

async function fixSpecificConsultant() {
  try {
    console.log('🔄 Fixing specific consultant data...');
    
    // Get consultant with ID 8 (FUSION)
    const consultant = await Consultant.findByPk(8);
    
    if (!consultant) {
      console.log('❌ Consultant not found');
      return;
    }
    
    console.log('📊 Found consultant:', consultant.agency_name);
    console.log('Current destination_countries:', consultant.destination_countries);
    console.log('Current courses:', consultant.courses);
    
    let needsUpdate = false;
    const updateData = {};
    
    // Fix destination_countries
    if (typeof consultant.destination_countries === 'string' && 
        consultant.destination_countries.includes('\\"')) {
      try {
        const parsed = JSON.parse(JSON.parse(consultant.destination_countries));
        updateData.destination_countries = parsed;
        needsUpdate = true;
        console.log('✅ Fixed destination_countries:', parsed);
      } catch (error) {
        console.warn('⚠️ Failed to parse destination_countries:', error.message);
      }
    }
    
    // Fix courses
    if (typeof consultant.courses === 'string' && 
        consultant.courses.includes('\\"')) {
      try {
        const parsed = JSON.parse(JSON.parse(consultant.courses));
        updateData.courses = parsed;
        needsUpdate = true;
        console.log('✅ Fixed courses:', parsed);
      } catch (error) {
        console.warn('⚠️ Failed to parse courses:', error.message);
      }
    }
    
    if (needsUpdate) {
      await consultant.update(updateData);
      console.log('🔄 Updated consultant successfully');
      
      // Verify the fix
      const updatedConsultant = await Consultant.findByPk(8);
      console.log('Updated destination_countries:', updatedConsultant.destination_countries);
      console.log('Updated courses:', updatedConsultant.courses);
    } else {
      console.log('ℹ️ No updates needed');
    }
    
    console.log('🎉 Fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run fix if called directly
if (require.main === module) {
  fixSpecificConsultant();
}

module.exports = fixSpecificConsultant;



