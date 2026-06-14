const express = require('express');
const jwt = require('jsonwebtoken');
const { Student, Consultant } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Student registration
router.post('/register/student', async (req, res) => {
  try {
    const { name, email, phone, password, location, country } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Create new student
    const student = await Student.create({
      name,
      email,
      phone,
      password_hash: password,
      location,
      country
    });

    // Generate token
    const token = generateToken(student.id, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: student.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Consultant registration
router.post('/register/consultant', async (req, res) => {
  try {
    const {
      agency_name,
      contact_person,
      email,
      phone,
      password,
      website,
      description,
      experience_years,
      fee_min,
      fee_max,
      fee_model,
      location,
      languages,
      gst_number,
      nda_accepted
    } = req.body;

    // Check if consultant already exists
    const existingConsultant = await Consultant.findOne({ where: { email } });
    if (existingConsultant) {
      return res.status(400).json({
        success: false,
        message: 'Consultant with this email already exists'
      });
    }

    // Create new consultant
    const consultant = await Consultant.create({
      agency_name,
      contact_person,
      email,
      phone,
      password_hash: password,
      website,
      description,
      experience_years,
      fee_min,
      fee_max,
      fee_model,
      location,
      languages: languages || [],
      gst_number,
      nda_accepted: nda_accepted || false
    });

    res.status(201).json({
      success: true,
      message: 'Consultant registered successfully. Please wait for admin approval.',
      data: {
        consultant: consultant.toJSON()
      }
    });
  } catch (error) {
    console.error('Consultant registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Student login
router.post('/login/student', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate password
    const isValidPassword = await student.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(student.id, 'student');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        student: student.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Consultant login
router.post('/login/consultant', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find consultant
    const consultant = await Consultant.findOne({ where: { email } });
    if (!consultant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if consultant is approved
    if (consultant.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval'
      });
    }

    // Validate password
    const isValidPassword = await consultant.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(consultant.id, 'consultant');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        consultant: consultant.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Consultant login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    let user;
    if (userType === 'student') {
      user = await Student.findByPk(userId);
    } else if (userType === 'consultant') {
      user = await Consultant.findByPk(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        userType
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;








