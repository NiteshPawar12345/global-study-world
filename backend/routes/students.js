const express = require('express');
const { Student, StudentInquiry, Consultant } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const student = await Student.findByPk(userId, {
      include: [{
        model: StudentInquiry,
        as: 'inquiries',
        order: [['created_at', 'DESC']]
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: { student }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student profile',
      error: error.message
    });
  }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      first_name,
      last_name,
      name,
      phone,
      location,
      country,
      date_of_birth,
      gender,
      current_education,
      budget_range,
      preferred_intake,
      interested_countries,
      interested_courses
    } = req.body;

    const parseListField = (field) => {
      if (typeof field === 'undefined' || field === null) return null;
      if (Array.isArray(field)) return field;

      if (typeof field === 'string') {
        if (!field.trim()) return [];
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (error) {
          // Not JSON, will fallback to comma separated parsing
        }

        return field
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      }

      return [];
    };

    const student = await Student.findByPk(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const updateData = {};

    if (typeof first_name !== 'undefined') updateData.first_name = first_name;
    if (typeof last_name !== 'undefined') updateData.last_name = last_name;
    if (typeof name !== 'undefined' && name !== null) updateData.name = name;
    if (typeof phone !== 'undefined') updateData.phone = phone;
    if (typeof location !== 'undefined') updateData.location = location;
    if (typeof country !== 'undefined') updateData.country = country;
    if (typeof date_of_birth !== 'undefined') updateData.date_of_birth = date_of_birth;
    if (typeof gender !== 'undefined') updateData.gender = gender;
    if (typeof current_education !== 'undefined') updateData.current_education = current_education;
    if (typeof budget_range !== 'undefined') updateData.budget_range = budget_range;
    if (typeof preferred_intake !== 'undefined') updateData.preferred_intake = preferred_intake;

    const parsedCountries = parseListField(interested_countries);
    if (parsedCountries !== null) updateData.interested_countries = parsedCountries;

    const parsedCourses = parseListField(interested_courses);
    if (parsedCourses !== null) updateData.interested_courses = parsedCourses;

    await student.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { student: student.toJSON() }
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get student inquiries
router.get('/inquiries', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const inquiries = await StudentInquiry.findAll({
      where: { student_id: userId },
      include: [
        {
          model: Consultant,
          as: 'consultant',
          attributes: ['id', 'agency_name', 'contact_person', 'email']
        },
        {
          model: Consultant,
          as: 'requestedConsultant',
          attributes: ['id', 'agency_name', 'contact_person', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { inquiries }
    });
  } catch (error) {
    console.error('Get student inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inquiries',
      error: error.message
    });
  }
});

module.exports = router;






