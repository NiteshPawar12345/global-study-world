const { sequelize } = require('../config/database');
const { StudentInquiry, Student, Consultant } = require('../models');

async function testConsultantInquiries() {
  try {
    console.log('🧪 Testing consultant inquiries retrieval...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');
    
    const consultantId = 8;
    
    // Test 1: Check if inquiries exist in DB
    console.log('1️⃣ Checking database directly...');
    const [dbCheck] = await sequelize.query(
      `SELECT id, student_id, consultant_id, status FROM student_inquiries WHERE consultant_id = ?`,
      {
        replacements: [consultantId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    console.log(`Found ${dbCheck ? dbCheck.length : 0} inquiries in database for consultant ${consultantId}:`);
    if (dbCheck && dbCheck.length > 0) {
      console.log(JSON.stringify(dbCheck, null, 2));
    }
    console.log('');
    
    // Test 2: Check with Sequelize
    console.log('2️⃣ Testing Sequelize query...');
    const inquiries = await StudentInquiry.findAll({
      where: { 
        consultant_id: consultantId
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`Sequelize found ${inquiries.length} inquiries`);
    if (inquiries.length > 0) {
      inquiries.forEach((inq, idx) => {
        console.log(`  Inquiry ${idx + 1}:`);
        console.log(`    ID: ${inq.id}`);
        console.log(`    Consultant ID: ${inq.consultant_id} (type: ${typeof inq.consultant_id})`);
        console.log(`    Student ID: ${inq.student_id}`);
        console.log(`    Student: ${inq.student ? `${inq.student.first_name} ${inq.student.last_name}` : 'NO STUDENT'}`);
        console.log(`    Status: ${inq.status}`);
      });
    } else {
      console.log('  ⚠️ No inquiries found with Sequelize!');
    }
    console.log('');
    
    // Test 3: Check consultant exists
    console.log('3️⃣ Verifying consultant exists...');
    const consultant = await Consultant.findByPk(consultantId);
    if (consultant) {
      console.log(`✅ Consultant ${consultantId} exists: ${consultant.agency_name}`);
      console.log(`   Status: ${consultant.status}`);
    } else {
      console.log(`❌ Consultant ${consultantId} does NOT exist!`);
    }
    console.log('');
    
    // Test 4: Check data types
    console.log('4️⃣ Checking data types...');
    const [typeCheck] = await sequelize.query(
      `SELECT 
        id, 
        consultant_id, 
        CAST(consultant_id AS UNSIGNED) as consultant_id_int,
        CAST(consultant_id AS CHAR) as consultant_id_str
      FROM student_inquiries 
      WHERE student_id = 2 
      LIMIT 1`
    );
    if (typeCheck.length > 0) {
      console.log('Sample inquiry data types:');
      console.log(JSON.stringify(typeCheck[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testConsultantInquiries();
