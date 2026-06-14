const express = require('express');
const { Consultant, Student, StudentInquiry, Review } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware (simplified - in production, implement proper role-based access)
const adminAuth = (req, res, next) => {
  // This is a simplified check - implement proper admin authentication
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Get dashboard statistics
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalConsultants = await Consultant.count({ where: { status: 'approved' } });
    const totalInquiries = await StudentInquiry.count();
    const completedInquiries = await StudentInquiry.count({ where: { status: 'completed' } });
    const pendingConsultants = await Consultant.count({ where: { status: 'pending' } });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalConsultants,
        totalInquiries,
        completedInquiries,
        pendingConsultants,
        totalRevenue: 0 // Add actual revenue calculation later
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
});

// Get pending consultants
router.get('/consultants/pending', auth, adminAuth, async (req, res) => {
  try {
    const consultants = await Consultant.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: { consultants }
    });
  } catch (error) {
    console.error('Get pending consultants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending consultants',
      error: error.message
    });
  }
});

// Approve/reject consultant
router.put('/consultants/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const consultant = await Consultant.findByPk(id);
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    await consultant.update({ status });

    res.json({
      success: true,
      message: `Consultant ${status} successfully`,
      data: { consultant: consultant.toJSON() }
    });
  } catch (error) {
    console.error('Update consultant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultant status',
      error: error.message
    });
  }
});

// Get all consultants
router.get('/consultants', auth, adminAuth, async (req, res) => {
  try {
    const consultants = await Consultant.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { consultants }
    });
  } catch (error) {
    console.error('Get consultants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultants',
      error: error.message
    });
  }
});

// Get detailed consultant information
router.get('/consultants/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultant = await Consultant.findByPk(id);
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    res.json({
      success: true,
      data: { 
        consultant: {
          id: consultant.id,
          agency_name: consultant.agency_name,
          email: consultant.email,
          status: consultant.status,
          contact_person: consultant.contact_person,
          phone: consultant.phone,
          location: consultant.location,
          experience_years: consultant.experience_years,
          total_placements: consultant.total_placements,
          success_rate: consultant.success_rate,
          response_time: consultant.response_time_hours,
          languages: consultant.languages,
          destination_countries: consultant.destination_countries,
          courses: consultant.courses,
          fee_min: consultant.fee_min,
          fee_max: consultant.fee_max,
          fee_model: consultant.fee_model,
          description: consultant.description,
          website: consultant.website,
          gst_number: consultant.gst_number,
          bank_name: consultant.bank_details?.bank_name,
          account_number: consultant.bank_details?.account_number,
          ifsc_code: consultant.bank_details?.ifsc_code,
          account_holder_name: consultant.bank_details?.account_holder_name,
          nda_accepted: consultant.nda_accepted,
          business_license: consultant.verification_documents?.business_license,
          gst_certificate: consultant.verification_documents?.gst_certificate,
          bank_statement: consultant.verification_documents?.bank_statement,
          identity_proof: consultant.verification_documents?.identity_proof,
          address_proof: consultant.verification_documents?.address_proof,
          created_at: consultant.created_at,
          updated_at: consultant.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get consultant details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultant details',
      error: error.message
    });
  }
});

// Get all inquiries
router.get('/inquiries', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const inquiries = await StudentInquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'email', 'mobile']
        },
        {
          model: Consultant,
          as: 'consultant',
          attributes: ['id', 'agency_name', 'contact_person', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        inquiries: inquiries.rows,
        pagination: {
          total: inquiries.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(inquiries.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiries',
      error: error.message
    });
  }
});

// Assign consultant to inquiry
router.put('/inquiries/:id/assign', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { consultant_id } = req.body;

    const inquiry = await StudentInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const targetConsultantId = consultant_id || inquiry.requested_consultant_id;

    if (!targetConsultantId) {
      return res.status(400).json({
        success: false,
        message: 'No consultant requested for this inquiry'
      });
    }

    if (inquiry.requested_consultant_id && consultant_id && inquiry.requested_consultant_id !== consultant_id) {
      return res.status(400).json({
        success: false,
        message: 'Consultant ID does not match the student\'s requested consultant'
      });
    }

    if (inquiry.requested_consultant_id && !consultant_id && inquiry.requested_consultant_id !== targetConsultantId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine consultant assignment'
      });
    }

    const consultant = await Consultant.findByPk(targetConsultantId);
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    await inquiry.update({
      consultant_id: targetConsultantId,
      requested_consultant_id: null,
      status: 'assigned',
      assigned_at: new Date()
    });

    // Get student details for notification
    const student = await Student.findByPk(inquiry.student_id);

    // Notify consultant
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.sendConsultantNotification(
        consultant.email,
        consultant.contact_person || consultant.agency_name,
        {
          student: {
            name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            phone: student.mobile
          },
          country_preference: inquiry.country_preference,
          course_preference: inquiry.course_preference,
          budget_min: inquiry.budget_min,
          budget_max: inquiry.budget_max,
          timeline: inquiry.timeline,
          additional_requirements: inquiry.additional_requirements
        }
      );
    } catch (emailError) {
      console.error('Error sending consultant notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Consultant assigned successfully',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Assign consultant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign consultant',
      error: error.message
    });
  }
});

// Get inquiry details
router.get('/inquiries/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await StudentInquiry.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'email', 'mobile', 'location']
        },
        {
          model: Consultant,
          as: 'consultant',
          attributes: ['id', 'agency_name', 'contact_person', 'email', 'phone']
        }
      ]
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: { inquiry }
    });
  } catch (error) {
    console.error('Get inquiry details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiry details',
      error: error.message
    });
  }
});

module.exports = router;



