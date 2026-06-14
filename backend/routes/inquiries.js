const express = require('express');
const { StudentInquiry, Student, Consultant, AdminUser } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Create new inquiry
router.post('/', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      country_preference,
      course_preference,
      budget_min,
      budget_max,
      timeline,
      additional_requirements,
      current_education,
      english_proficiency,
      work_experience,
      consultant_id
    } = req.body;

    // Parse consultant_id to integer if provided
    const parsedConsultantId = consultant_id ? parseInt(consultant_id, 10) : null;
    
    // Validate consultant (now mandatory)
    if (!parsedConsultantId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a consultant'
      });
    }
    
    const requestedConsultant = await Consultant.findByPk(parsedConsultantId);
    if (!requestedConsultant) {
      return res.status(400).json({
        success: false,
        message: 'Selected consultant does not exist'
      });
    }
    if (requestedConsultant.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Selected consultant is not approved. Please select another consultant.'
      });
    }
    
    // New inquiries remain pending until admin approval
    const status = 'pending';
    const assigned_at = null;

    console.log('Creating inquiry - student_id:', userId, 'consultant_id:', parsedConsultantId, 'status:', status);
    console.log('Consultant ID from request:', consultant_id, 'Type:', typeof consultant_id);
    console.log('Parsed consultant ID:', parsedConsultantId, 'Type:', typeof parsedConsultantId);

    const inquiry = await StudentInquiry.create({
      student_id: userId,
      consultant_id: null,
      requested_consultant_id: parsedConsultantId,
      country_preference,
      course_preference,
      budget_min,
      budget_max,
      timeline,
      additional_requirements,
      current_education: current_education || null,
      english_proficiency: english_proficiency || null,
      work_experience: work_experience || null,
      status,
      assigned_at
    });
    
    // Log the created inquiry to verify consultant_id was stored correctly
    console.log('✅ Inquiry created successfully:', {
      id: inquiry.id,
      student_id: inquiry.student_id,
      consultant_id: inquiry.consultant_id,
      requested_consultant_id: inquiry.requested_consultant_id,
      consultant_id_type: typeof inquiry.consultant_id,
      consultant_id_raw: inquiry.dataValues?.consultant_id,
      status: inquiry.status
    });

    // Get student details for notification
    const student = await Student.findByPk(userId);

    // Send confirmation email to student
    try {
      await notificationService.sendInquiryConfirmation(
        student.email,
        `${student.first_name} ${student.last_name}`,
        {
          country_preference,
          course_preference,
          budget_min,
          budget_max,
          timeline
        }
      );
    } catch (emailError) {
      console.error('Error sending student confirmation email:', emailError);
    }

    const inquiryPayload = {
      inquiry_id: inquiry.id,
      country_preference,
      course_preference,
      budget_min,
      budget_max,
      timeline,
      additional_requirements,
      student: {
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        phone: student.mobile
      },
      requested_consultant: {
        id: requestedConsultant.id,
        name: requestedConsultant.contact_person || requestedConsultant.agency_name,
        email: requestedConsultant.email
      }
    };
    
    // Notify consultant about the new inquiry (pending admin approval)
    try {
      await notificationService.sendConsultantPendingInquiryNotification(
        requestedConsultant.email,
        requestedConsultant.contact_person || requestedConsultant.agency_name,
        inquiryPayload
      );
    } catch (consultantEmailError) {
      console.error('Error sending consultant notification email:', consultantEmailError);
    }

    // Notify admin about all inquiries
    try {
      const admins = await AdminUser.findAll({ where: { is_active: true } });
      for (const admin of admins) {
        await notificationService.sendAdminInquiryNotification(
          admin.email,
          admin.name || 'Admin',
          {
            ...inquiryPayload,
            consultant_id: null,
            requested_consultant_id: parsedConsultantId
          }
        );
      }
    } catch (adminEmailError) {
      console.error('Error sending admin notification email:', adminEmailError);
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. Admin approval is pending for your selected consultant.',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
      error: error.message
    });
  }
});

// Get inquiries for consultant
router.get('/consultant', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    console.log('\n=== CONSULTANT INQUIRIES REQUEST START ===');
    console.log('User from token - userId:', userId, 'Type:', typeof userId);
    console.log('User from token - userType:', userType);

    if (userType !== 'consultant') {
      console.log('❌ Access denied - not a consultant');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Ensure userId is an integer
    const consultantId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    console.log('Parsed consultant ID:', consultantId, 'Type:', typeof consultantId);
    
    // Validate consultantId
    if (isNaN(consultantId) || !consultantId) {
      console.log('❌ Invalid consultant ID');
      return res.status(400).json({
        success: false,
        message: 'Invalid consultant ID'
      });
    }

    // Verify consultant exists
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) {
      console.log(`❌ Consultant with ID ${consultantId} does not exist`);
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }
    console.log(`✅ Consultant found: ${consultant.agency_name} (ID: ${consultant.id})`);
    console.log(`🔍 Searching for inquiries with consultant_id = ${consultantId} (type: ${typeof consultantId})`);

    const { sequelize } = require('../config/database');
    
    // First, let's verify the query will work by checking what's in the database
    const [testQuery] = await sequelize.query(
      `SELECT id, consultant_id, CAST(consultant_id AS CHAR) as consultant_id_str, student_id FROM student_inquiries WHERE consultant_id = ? LIMIT 5`,
      {
        replacements: [consultantId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    console.log(`🔍 Test query with consultantId ${consultantId} found:`, JSON.stringify(testQuery, null, 2));
    
    // Use raw SQL query to fetch inquiries - this is the most reliable method
    // Fetch ALL inquiries where consultant_id matches the logged-in consultant
    const queryResult = await sequelize.query(
      `SELECT 
        si.*,
        s.id as student_id_db,
        s.first_name,
        s.last_name,
        s.email,
        s.mobile,
        s.location
      FROM student_inquiries si
      LEFT JOIN students s ON si.student_id = s.id
      WHERE si.consultant_id = ?
      ORDER BY si.created_at DESC`,
      {
        replacements: [consultantId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    // Handle the result - Sequelize.query with SELECT returns [results, metadata] or just results
    // When using QueryTypes.SELECT, it returns an array directly, but sometimes it's wrapped
    let inquiriesRaw = queryResult;
    
    // If queryResult is a tuple [results, metadata], extract the results
    if (Array.isArray(queryResult) && queryResult.length === 2) {
      inquiriesRaw = queryResult[0];
    } else {
      inquiriesRaw = queryResult;
    }
    
    // Ensure inquiriesRaw is always an array
    // If it's a single object, wrap it in an array
    let inquiriesArray = [];
    if (Array.isArray(inquiriesRaw)) {
      inquiriesArray = inquiriesRaw;
    } else if (inquiriesRaw && typeof inquiriesRaw === 'object') {
      // Single result returned as object, wrap it in array
      inquiriesArray = [inquiriesRaw];
    }
    
    console.log('Query result handling:', {
      queryResultType: typeof queryResult,
      queryResultIsArray: Array.isArray(queryResult),
      inquiriesRawType: typeof inquiriesRaw,
      inquiriesRawIsArray: Array.isArray(inquiriesRaw),
      inquiriesArrayLength: inquiriesArray.length
    });
    
    console.log(`✅ Found ${inquiriesArray.length} inquiries for consultant ${consultantId}`);
    console.log('Raw query result type:', typeof inquiriesRaw, 'Is array:', Array.isArray(inquiriesRaw));
    
    // Debug: Check if there are any inquiries at all in the database
    if (inquiriesArray.length === 0) {
      console.log('⚠️ No inquiries found. Checking database...');
      const [allInquiries] = await sequelize.query(
        `SELECT id, student_id, consultant_id, status FROM student_inquiries ORDER BY created_at DESC LIMIT 10`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('All inquiries in database (last 10):', JSON.stringify(allInquiries, null, 2));
      
      // Also check specifically for consultant_id = 8
      const [check8] = await sequelize.query(
        `SELECT id, student_id, consultant_id, status FROM student_inquiries WHERE consultant_id = 8`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log(`Inquiries with consultant_id = 8:`, JSON.stringify(check8, null, 2));
    } else {
      console.log('Sample inquiry:', JSON.stringify(inquiriesArray[0], null, 2));
    }
    
    // Transform the raw results to match the expected format
    const inquiriesData = inquiriesArray.map(inq => ({
      id: inq.id,
      student_id: inq.student_id,
      consultant_id: inq.consultant_id,
      country_preference: inq.country_preference,
      course_preference: inq.course_preference,
      budget_min: inq.budget_min,
      budget_max: inq.budget_max,
      timeline: inq.timeline,
      additional_requirements: inq.additional_requirements,
      current_education: inq.current_education,
      english_proficiency: inq.english_proficiency,
      work_experience: inq.work_experience,
      status: inq.status,
      assigned_at: inq.assigned_at,
      responded_at: inq.responded_at,
      completed_at: inq.completed_at,
      created_at: inq.created_at,
      updated_at: inq.updated_at,
      student: inq.first_name ? {
        id: inq.student_id_db,
        first_name: inq.first_name,
        last_name: inq.last_name,
        email: inq.email,
        mobile: inq.mobile,
        location: inq.location
      } : null
    }));
    
    // Log each inquiry found for debugging
    inquiriesData.forEach((inq, idx) => {
      console.log(`Inquiry ${idx + 1}:`, {
        id: inq.id,
        consultant_id: inq.consultant_id,
        student_id: inq.student_id,
        student_name: inq.student ? `${inq.student.first_name} ${inq.student.last_name}` : 'NO STUDENT',
        status: inq.status
      });
    });

    console.log(`=== RETURNING ${inquiriesData.length} INQUIRIES ===\n`);
    
    res.json({
      success: true,
      data: { inquiries: inquiriesData }
    });
  } catch (error) {
    console.error('❌ Get consultant inquiries error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiries',
      error: error.message
    });
  }
});

// Debug endpoint to check consultant inquiries (temporary - remove after debugging)
router.get('/consultant/debug', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { sequelize } = require('../config/database');
    
    const consultantId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Get all inquiries for this consultant
    const [allInquiries] = await sequelize.query(
      `SELECT * FROM student_inquiries WHERE consultant_id = ?`,
      {
        replacements: [consultantId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    // Get consultant info
    const consultant = await Consultant.findByPk(consultantId);
    
    res.json({
      success: true,
      debug: {
        consultantId,
        consultantIdType: typeof consultantId,
        userId,
        userIdType: typeof userId,
        consultant: consultant ? {
          id: consultant.id,
          agency_name: consultant.agency_name,
          status: consultant.status
        } : null,
        inquiriesFound: allInquiries ? allInquiries.length : 0,
        inquiries: allInquiries || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update inquiry status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await StudentInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check permissions
    if (userType === 'consultant' && inquiry.consultant_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userType === 'student' && inquiry.student_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { status };

    // Set timestamps based on status
    if (status === 'in_progress' && !inquiry.responded_at) {
      updateData.responded_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await inquiry.update(updateData);

    res.json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status',
      error: error.message
    });
  }
});

module.exports = router;
