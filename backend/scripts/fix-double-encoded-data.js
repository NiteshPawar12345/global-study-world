const { Consultant } = require('../models');
const { sequelize } = require('../config/database');

async function fixDoubleEncodedData() {
  try {
    console.log('🔄 Starting double-encoded data fix...');
    
    // Get all consultants with double-encoded data
    const consultants = await Consultant.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          sequelize.Sequelize.where(
            sequelize.Sequelize.fn('JSON_VALID', sequelize.Sequelize.col('destination_countries')),
            false
          ),
          sequelize.Sequelize.where(
            sequelize.Sequelize.fn('JSON_VALID', sequelize.Sequelize.col('courses')),
            false
          )
        ]
      }
    });
    
    console.log(`📊 Found ${consultants.length} consultants with double-encoded data`);
    
    for (const consultant of consultants) {
      let needsUpdate = false;
      const updateData = {};
      
      // Fix destination_countries
      if (typeof consultant.destination_countries === 'string' && 
          consultant.destination_countries.startsWith('"')) {
        try {
          const parsed = JSON.parse(JSON.parse(consultant.destination_countries));
          updateData.destination_countries = parsed;
          needsUpdate = true;
          console.log(`✅ Fixed destination_countries for consultant ${consultant.id}`);
        } catch (error) {
          console.warn(`⚠️ Failed to parse destination_countries for consultant ${consultant.id}:`, error.message);
        }
      }
      
      // Fix courses
      if (typeof consultant.courses === 'string' && 
          consultant.courses.startsWith('"')) {
        try {
          const parsed = JSON.parse(JSON.parse(consultant.courses));
          updateData.courses = parsed;
          needsUpdate = true;
          console.log(`✅ Fixed courses for consultant ${consultant.id}`);
        } catch (error) {
          console.warn(`⚠️ Failed to parse courses for consultant ${consultant.id}:`, error.message);
        }
      }
      
      if (needsUpdate) {
        await consultant.update(updateData);
        console.log(`🔄 Updated consultant ${consultant.id}: ${consultant.agency_name}`);
      }
    }
    
    console.log('🎉 Double-encoded data fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run fix if called directly
if (require.main === module) {
  fixDoubleEncodedData();
}

module.exports = fixDoubleEncodedData;



