const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Consultant, Review, StudentInquiry, Country, Course } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './uploads/consultants';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'));
    }
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Consultants API is working!' });
});

// Get all countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { countries }
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get countries',
      error: error.message
    });
  }
});

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses',
      error: error.message
    });
  }
});

// Get all consultants (including pending) - for testing purposes
router.get('/all', async (req, res) => {
  try {
    const consultants = await Consultant.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { consultants }
    });
  } catch (error) {
    console.error('Get all consultants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultants',
      error: error.message
    });
  }
});

// Get all consultants (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      country, 
      course, 
      budget,
      language,
      experience,
      rating, 
      location,
      feeModel,
      sort = 'most-trusted' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    let whereClause = { status: 'approved' };
    let orderClause = [['created_at', 'DESC']];

    // Apply destination country filter
    if (country) {
      whereClause.destination_countries = {
        [Op.like]: `%${country}%`
      };
    }

    // Apply course filter
    if (course) {
      whereClause.courses = {
        [Op.like]: `%${course}%`
      };
    }

    // Apply language filter
    if (language) {
      whereClause.languages = {
        [Op.like]: `%${language}%`
      };
    }

    // Apply location filter
    if (location) {
      whereClause.location = {
        [Op.like]: `%${location}%`
      };
    }

    // Apply experience filter
    if (experience) {
      switch (experience) {
        case '0-2':
          whereClause.experience_years = { [Op.between]: [0, 2] };
          break;
        case '2-5':
          whereClause.experience_years = { [Op.between]: [2, 5] };
          break;
        case '5-10':
          whereClause.experience_years = { [Op.between]: [5, 10] };
          break;
        case '10+':
          whereClause.experience_years = { [Op.gte]: 10 };
          break;
      }
    }

    // Apply budget filter
    if (budget) {
      switch (budget) {
        case 'under-10l':
          whereClause.fee_max = { [Op.lte]: 1000000 }; // 10 lakhs
          break;
        case '10-20l':
          whereClause.fee_max = { [Op.between]: [1000000, 2000000] };
          break;
        case '20-30l':
          whereClause.fee_max = { [Op.between]: [2000000, 3000000] };
          break;
        case '30-50l':
          whereClause.fee_max = { [Op.between]: [3000000, 5000000] };
          break;
        case 'above-50l':
          whereClause.fee_max = { [Op.gte]: 5000000 };
          break;
      }
    }

    // Apply fee model filter
    if (feeModel) {
      whereClause.fee_model = feeModel;
    }

    // Apply sorting
    switch (sort) {
      case 'most-trusted':
        orderClause = [['is_verified', 'DESC'], ['total_placements', 'DESC']];
        break;
      case 'lowest-fee':
        orderClause = [['fee_min', 'ASC']];
        break;
      case 'most-experienced':
        orderClause = [['experience_years', 'DESC']];
        break;
      case 'most-reviews':
        orderClause = [['total_placements', 'DESC']];
        break;
    }

    const consultants = await Consultant.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Parse JSON fields for each consultant
    const parsedConsultants = consultants.rows.map(consultant => {
      let parsedDestinationCountries = consultant.destination_countries;
      let parsedCourses = consultant.courses;
      let parsedLanguages = consultant.languages;

      try {
        if (typeof consultant.destination_countries === 'string') {
          parsedDestinationCountries = JSON.parse(consultant.destination_countries);
        }
      } catch (error) {
        console.warn('Failed to parse destination countries for consultant:', consultant.id);
      }

      try {
        if (typeof consultant.courses === 'string') {
          parsedCourses = JSON.parse(consultant.courses);
        }
      } catch (error) {
        console.warn('Failed to parse courses for consultant:', consultant.id);
      }

      try {
        if (typeof consultant.languages === 'string') {
          parsedLanguages = JSON.parse(consultant.languages);
        }
      } catch (error) {
        console.warn('Failed to parse languages for consultant:', consultant.id);
      }

      return {
        ...consultant.toJSON(),
        destination_countries: parsedDestinationCountries,
        courses: parsedCourses,
        languages: parsedLanguages
      };
    });

    res.json({
      success: true,
      data: {
        consultants: parsedConsultants,
        pagination: {
          total: consultants.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(consultants.count / limit)
        }
      }
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

// Get consultant by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const consultant = await Consultant.findByPk(id, {
      include: [{
        model: Review,
        as: 'reviews',
        limit: 10,
        order: [['created_at', 'DESC']]
      }]
    });

    if (!consultant || consultant.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    // Calculate average rating
    const reviews = await Review.findAll({
      where: { consultant_id: id, is_public: true }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        consultant: consultant.toJSON(),
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Get consultant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultant',
      error: error.message
    });
  }
});

// Get consultant profile (authenticated)
router.get('/profile/me', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'consultant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const consultant = await Consultant.findByPk(userId, {
      include: [
        {
          model: StudentInquiry,
          as: 'inquiries',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!consultant) {
      return res.status(404).json({
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

    // Create a clean consultant object with parsed data
    const cleanConsultant = {
      ...consultant.toJSON(),
      destination_countries: parsedDestinationCountries,
      courses: parsedCourses
    };

    res.json({
      success: true,
      data: { consultant: cleanConsultant }
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
router.put('/profile/me', auth, upload.fields([
  { name: 'profile_picture', maxCount: 1 }
]), async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'consultant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      agency_name,
      contact_person,
      phone,
      website,
      description,
      experience_years,
      fee_min,
      fee_max,
      fee_model,
      location,
      languages,
      destination_countries,
      courses
    } = req.body;

    const consultant = await Consultant.findByPk(userId);
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found'
      });
    }

    // Parse destination countries and courses for update
    let parsedDestinationCountries = consultant.destination_countries;
    if (destination_countries !== undefined) {
      try {
        parsedDestinationCountries = typeof destination_countries === 'string' 
          ? JSON.parse(destination_countries) 
          : destination_countries;
      } catch (error) {
        console.warn('Failed to parse destination countries:', error);
      }
    }

    let parsedCourses = consultant.courses;
    if (courses !== undefined) {
      try {
        parsedCourses = typeof courses === 'string' 
          ? JSON.parse(courses) 
          : courses;
      } catch (error) {
        console.warn('Failed to parse courses:', error);
      }
    }

    let parsedLanguages = consultant.languages;
    if (languages !== undefined) {
      try {
        parsedLanguages = typeof languages === 'string' 
          ? JSON.parse(languages) 
          : languages;
      } catch (error) {
        console.warn('Failed to parse languages:', error);
      }
    }

    // Handle profile picture upload
    let profile_picture = consultant.profile_picture;
    if (req.files?.profile_picture?.[0]) {
      profile_picture = req.files.profile_picture[0].filename;
    }

    await consultant.update({
      agency_name: agency_name || consultant.agency_name,
      contact_person: contact_person || consultant.contact_person,
      phone: phone || consultant.phone,
      website: website || consultant.website,
      profile_picture: profile_picture,
      description: description || consultant.description,
      experience_years: experience_years || consultant.experience_years,
      fee_min: fee_min || consultant.fee_min,
      fee_max: fee_max || consultant.fee_max,
      fee_model: fee_model || consultant.fee_model,
      location: location || consultant.location,
      languages: parsedLanguages,
      destination_countries: parsedDestinationCountries,
      courses: parsedCourses
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { consultant: consultant.toJSON() }
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

// Consultant registration (public)
router.post('/register', upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'business_license', maxCount: 1 },
  { name: 'gst_certificate', maxCount: 1 },
  { name: 'bank_statement', maxCount: 1 },
  { name: 'identity_proof', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 },
  { name: 'certifications_0', maxCount: 1 },
  { name: 'certifications_1', maxCount: 1 },
  { name: 'certifications_2', maxCount: 1 }
]), async (req, res) => {
  console.log('📝 Consultant registration request received:', req.body);
  console.log('📁 Files received:', req.files);
  
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
      total_placements,
      success_rate,
      response_time_hours,
      fee_min,
      fee_max,
      fee_model,
      location,
      languages,
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
    const existingConsultant = await Consultant.findOne({ where: { email } });
    if (existingConsultant) {
      return res.status(400).json({
        success: false,
        message: 'Consultant with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);

    // Process uploaded files
    const verification_documents = {};
    let profile_picture = null;
    
    if (req.files) {
      // Handle profile picture
      if (req.files.profile_picture && req.files.profile_picture[0]) {
        profile_picture = req.files.profile_picture[0].filename;
      }
      
      // Handle single file uploads
      ['business_license', 'gst_certificate', 'bank_statement', 'identity_proof', 'address_proof'].forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          verification_documents[field] = req.files[field][0].filename;
        }
      });

      // Handle multiple certifications
      const certifications = [];
      Object.keys(req.files).forEach(key => {
        if (key.startsWith('certifications_')) {
          certifications.push(req.files[key][0].filename);
        }
      });
      if (certifications.length > 0) {
        verification_documents.certifications = certifications;
      }
    }

    // Process bank details
    const bank_details = {};
    if (bank_name || account_number || ifsc_code || account_holder_name) {
      bank_details.bank_name = bank_name;
      bank_details.account_number = account_number;
      bank_details.ifsc_code = ifsc_code;
      bank_details.account_holder_name = account_holder_name;
    }

    // Parse languages if it's a string
    let parsedLanguages = [];
    if (languages) {
      try {
        parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;
      } catch (e) {
        console.warn('Failed to parse languages:', e);
        parsedLanguages = [];
      }
    }

    // Parse destination countries
    let parsedDestinationCountries = [];
    if (destination_countries) {
      try {
        parsedDestinationCountries = typeof destination_countries === 'string' 
          ? JSON.parse(destination_countries) 
          : destination_countries;
      } catch (e) {
        console.warn('Failed to parse destination countries:', e);
        parsedDestinationCountries = [];
      }
    }

    // Parse courses
    let parsedCourses = [];
    if (courses) {
      try {
        parsedCourses = typeof courses === 'string' 
          ? JSON.parse(courses) 
          : courses;
      } catch (e) {
        console.warn('Failed to parse courses:', e);
        parsedCourses = [];
      }
    }

    // Create consultant
    const consultant = await Consultant.create({
      agency_name,
      contact_person,
      email,
      phone,
      password_hash,
      website,
      profile_picture,
      description,
      experience_years: experience_years ? parseInt(experience_years) : null,
      total_placements: total_placements ? parseInt(total_placements) : 0,
      success_rate: success_rate ? parseFloat(success_rate) : 0,
      response_time_hours: response_time_hours ? parseInt(response_time_hours) : 24,
      fee_min: fee_min ? parseFloat(fee_min) : null,
      fee_max: fee_max ? parseFloat(fee_max) : null,
      fee_model: fee_model || 'fixed',
      location,
      languages: parsedLanguages,
      destination_countries: parsedDestinationCountries,
      courses: parsedCourses,
      gst_number,
      bank_details: Object.keys(bank_details).length > 0 ? bank_details : null,
      verification_documents: Object.keys(verification_documents).length > 0 ? verification_documents : null,
      nda_accepted: nda_accepted === 'true' || nda_accepted === true,
      status: 'pending'
    });

    // Remove sensitive data from response
    const consultantData = consultant.toJSON();
    delete consultantData.verification_documents;
    delete consultantData.bank_details;

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. We will review your application within 24-48 hours.',
      data: { consultant: consultantData }
    });
  } catch (error) {
    console.error('Consultant registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register consultant',
      error: error.message
    });
  }
});

module.exports = router;

