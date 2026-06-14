const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Consultant, Country, Course } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/consultants/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Consultant Signup
router.post('/signup', upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'business_license', maxCount: 1 },
  { name: 'gst_certificate', maxCount: 1 },
  { name: 'bank_statement', maxCount: 1 },
  { name: 'identity_proof', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📝 Consultant signup request received:', req.body);
    console.log('📁 Files received:', req.files);
    
    const {
      agency_name,
      contact_person,
      email,
      phone,
      password,
      website,
      location,
      experience_years,
      total_placements,
      success_rate,
      response_time,
      languages,
      fee_min,
      fee_max,
      fee_model,
      description,
      gst_number,
      bank_name,
      account_number,
      ifsc_code,
      account_holder_name,
      nda_accepted,
      destination_countries,
      courses
    } = req.body;

    // Check if consultant already exists
    console.log('🔍 Checking for existing consultant with email:', email, 'and agency_name:', agency_name);
    const existingConsultant = await Consultant.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { agency_name: agency_name }
        ]
      }
    });

    if (existingConsultant) {
      console.log('❌ Found existing consultant:', {
        id: existingConsultant.id,
        email: existingConsultant.email,
        agency_name: existingConsultant.agency_name
      });
      return res.status(400).json({
        success: false,
        message: 'Consultant with this email or agency name already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Parse languages array
    const languagesArray = languages ? JSON.parse(languages) : [];

    // Parse destination countries
    let destinationCountriesArray = [];
    if (destination_countries) {
      try {
        destinationCountriesArray = typeof destination_countries === 'string' 
          ? JSON.parse(destination_countries) 
          : destination_countries;
      } catch (error) {
        console.warn('Failed to parse destination countries:', error);
        destinationCountriesArray = [];
      }
    }

    // Parse courses
    let coursesArray = [];
    if (courses) {
      try {
        coursesArray = typeof courses === 'string' 
          ? JSON.parse(courses) 
          : courses;
      } catch (error) {
        console.warn('Failed to parse courses:', error);
        coursesArray = [];
      }
    }

    // Handle file uploads
    const verification_documents = {};
    let profile_picture = null;
    
    // Handle profile picture
    if (req.files?.profile_picture?.[0]) {
      profile_picture = req.files.profile_picture[0].filename;
    }
    
    if (req.files?.business_license?.[0]) {
      verification_documents.business_license = req.files.business_license[0].filename;
    }
    if (req.files?.gst_certificate?.[0]) {
      verification_documents.gst_certificate = req.files.gst_certificate[0].filename;
    }
    if (req.files?.bank_statement?.[0]) {
      verification_documents.bank_statement = req.files.bank_statement[0].filename;
    }
    if (req.files?.identity_proof?.[0]) {
      verification_documents.identity_proof = req.files.identity_proof[0].filename;
    }
    if (req.files?.address_proof?.[0]) {
      verification_documents.address_proof = req.files.address_proof[0].filename;
    }

    // Create consultant
    const consultant = await Consultant.create({
      agency_name,
      contact_person,
      email,
      phone,
      password_hash: passwordHash,
      website,
      profile_picture,
      location,
      experience_years: parseInt(experience_years),
      total_placements: total_placements ? parseInt(total_placements) : 0,
      success_rate: success_rate ? parseFloat(success_rate) : 0,
      response_time_hours: response_time ? parseInt(response_time) : 24,
      languages: languagesArray,
      destination_countries: destinationCountriesArray,
      courses: coursesArray,
      fee_min: parseInt(fee_min),
      fee_max: parseInt(fee_max),
      fee_model,
      description,
      gst_number,
      bank_details: {
        bank_name,
        account_number,
        ifsc_code,
        account_holder_name
      },
      verification_documents,
      nda_accepted: nda_accepted === 'true',
      status: 'pending'
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: consultant.id, 
        userType: 'consultant',
        email: consultant.email 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Consultant registered successfully. Your application is under review.',
      data: {
        consultant: {
          id: consultant.id,
          agency_name: consultant.agency_name,
          email: consultant.email,
          status: consultant.status
        },
        token
      }
    });

  } catch (error) {
    console.error('Consultant signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register consultant',
      error: error.message
    });
  }
});

// Consultant Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for email:', email);
    console.log('🔑 Password received:', password ? 'YES' : 'NO');

    // Find consultant
    const consultant = await Consultant.findOne({
      where: { email: email }
    });

    if (!consultant) {
      console.log('❌ Consultant not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Consultant found:', {
      id: consultant.id,
      email: consultant.email,
      status: consultant.status,
      agency_name: consultant.agency_name
    });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, consultant.password_hash);
    console.log('🔐 Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Password valid for email:', email);

    // Check if consultant is active
    if (consultant.status === 'rejected' || consultant.status === 'suspended') {
      console.log('❌ Account deactivated for email:', email, 'status:', consultant.status);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    console.log('✅ Account status OK for email:', email, 'status:', consultant.status);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: consultant.id, 
        userType: 'consultant',
        email: consultant.email 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Update last login
    await consultant.update({ last_login: new Date() });

    res.json({
      success: true,
      message: 'Login successful',
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
        },
        token
      }
    });

  } catch (error) {
    console.error('Consultant login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});

// Get consultant profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (decoded.userType !== 'consultant') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const consultant = await Consultant.findByPk(decoded.userId);
    
    if (!consultant) {
      return res.status(401).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    // Parse double-encoded JSON fields
    let parsedDestinationCountries = consultant.destination_countries;
    let parsedCourses = consultant.courses;
    
    try {
      if (typeof consultant.destination_countries === 'string') {
        parsedDestinationCountries = JSON.parse(JSON.parse(consultant.destination_countries));
      }
    } catch (error) {
      console.warn('Failed to parse destination countries:', error);
    }
    
    try {
      if (typeof consultant.courses === 'string') {
        parsedCourses = JSON.parse(JSON.parse(consultant.courses));
      }
    } catch (error) {
      console.warn('Failed to parse courses:', error);
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
          destination_countries: parsedDestinationCountries,
          courses: parsedCourses,
          fee_min: consultant.fee_min,
          fee_max: consultant.fee_max,
          fee_model: consultant.fee_model,
          description: consultant.description,
          website: consultant.website,
          profile_picture: consultant.profile_picture,
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
    console.error('Get consultant profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultant profile',
      error: error.message
    });
  }
});

// Update consultant profile
router.put('/profile', upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'business_license', maxCount: 1 },
  { name: 'gst_certificate', maxCount: 1 },
  { name: 'bank_statement', maxCount: 1 },
  { name: 'identity_proof', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 }
]), async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (decoded.userType !== 'consultant') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const consultant = await Consultant.findByPk(decoded.userId);
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    const updateData = { ...req.body };

    // Handle file uploads - only update if new files are provided
    if (req.files?.profile_picture?.[0]) {
      updateData.profile_picture = req.files.profile_picture[0].filename;
    }
    if (req.files?.business_license?.[0]) {
      updateData.business_license = req.files.business_license[0].filename;
    }
    if (req.files?.gst_certificate?.[0]) {
      updateData.gst_certificate = req.files.gst_certificate[0].filename;
    }
    if (req.files?.bank_statement?.[0]) {
      updateData.bank_statement = req.files.bank_statement[0].filename;
    }
    if (req.files?.identity_proof?.[0]) {
      updateData.identity_proof = req.files.identity_proof[0].filename;
    }
    if (req.files?.address_proof?.[0]) {
      updateData.address_proof = req.files.address_proof[0].filename;
    }

    // Parse languages if provided
    if (updateData.languages) {
      updateData.languages = JSON.parse(updateData.languages);
    }

    // Parse destination countries if provided
    if (updateData.destination_countries) {
      updateData.destination_countries = JSON.parse(updateData.destination_countries);
    }

    // Parse courses if provided
    if (updateData.courses) {
      updateData.courses = JSON.parse(updateData.courses);
    }

    // Convert numeric fields
    if (updateData.experience_years) {
      updateData.experience_years = parseInt(updateData.experience_years);
    }
    if (updateData.total_placements) {
      updateData.total_placements = parseInt(updateData.total_placements);
    }
    if (updateData.success_rate) {
      updateData.success_rate = parseFloat(updateData.success_rate);
    }
    if (updateData.response_time) {
      updateData.response_time = parseInt(updateData.response_time);
    }
    if (updateData.fee_min) {
      updateData.fee_min = parseInt(updateData.fee_min);
    }
    if (updateData.fee_max) {
      updateData.fee_max = parseInt(updateData.fee_max);
    }

    // Remove password_hash from update data
    delete updateData.password_hash;

    await consultant.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
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
          response_time: consultant.response_time,
          languages: consultant.languages,
          destination_countries: consultant.destination_countries,
          courses: consultant.courses,
          fee_min: consultant.fee_min,
          fee_max: consultant.fee_max,
          fee_model: consultant.fee_model,
          description: consultant.description,
          website: consultant.website,
          profile_picture: consultant.profile_picture,
          gst_number: consultant.gst_number,
          bank_name: consultant.bank_name,
          account_number: consultant.account_number,
          ifsc_code: consultant.ifsc_code,
          account_holder_name: consultant.account_holder_name,
          nda_accepted: consultant.nda_accepted,
          business_license: consultant.business_license,
          gst_certificate: consultant.gst_certificate,
          bank_statement: consultant.bank_statement,
          identity_proof: consultant.identity_proof,
          address_proof: consultant.address_proof,
          created_at: consultant.created_at,
          updated_at: consultant.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update consultant profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;
