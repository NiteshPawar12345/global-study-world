const express = require('express');
const jwt = require('jsonwebtoken');
const { Student } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Student Signup
router.post('/signup', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      mobile,
      password,
      date_of_birth,
      gender,
      current_education,
      interested_countries,
      interested_courses,
      budget_range,
      preferred_intake
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: email },
          { mobile: mobile }
        ]
      }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or mobile already exists'
      });
    }

    // Create new student
    const student = await Student.create({
      first_name,
      last_name,
      email,
      mobile,
      password_hash: password, // Will be hashed by the model hook
      date_of_birth,
      gender,
      current_education,
      interested_countries: interested_countries || [],
      interested_courses: interested_courses || [],
      budget_range,
      preferred_intake
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: student.id, 
        userType: 'student',
        email: student.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        token,
        student: student.toJSON()
      }
    });

  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find student by email
    const student = await Student.findOne({
      where: { email: email }
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await student.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await student.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: student.id, 
        userType: 'student',
        email: student.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        student: student.toJSON()
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
});

// Get student profile
router.get('/me', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const student = await Student.findByPk(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: { student: student.toJSON() }
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
      date_of_birth,
      gender,
      current_education,
      interested_countries,
      interested_courses,
      budget_range,
      preferred_intake
    } = req.body;

    const student = await Student.findByPk(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update student
    await student.update({
      first_name: first_name || student.first_name,
      last_name: last_name || student.last_name,
      date_of_birth: date_of_birth || student.date_of_birth,
      gender: gender || student.gender,
      current_education: current_education || student.current_education,
      interested_countries: interested_countries || student.interested_countries,
      interested_courses: interested_courses || student.interested_courses,
      budget_range: budget_range || student.budget_range,
      preferred_intake: preferred_intake || student.preferred_intake
    });

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

module.exports = router;



