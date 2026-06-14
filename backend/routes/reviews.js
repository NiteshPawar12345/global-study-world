const express = require('express');
const { Review, Student, Consultant, StudentInquiry } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can create reviews'
      });
    }

    const { consultant_id, inquiry_id, rating, title, comment } = req.body;

    // Check if student has completed an inquiry with this consultant
    const inquiry = await StudentInquiry.findOne({
      where: {
        id: inquiry_id,
        student_id: userId,
        consultant_id: consultant_id,
        status: 'completed'
      }
    });

    if (!inquiry) {
      return res.status(400).json({
        success: false,
        message: 'You can only review consultants you have worked with'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        student_id: userId,
        consultant_id: consultant_id,
        inquiry_id: inquiry_id
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this consultant for this inquiry'
      });
    }

    const review = await Review.create({
      student_id: userId,
      consultant_id: consultant_id,
      inquiry_id: inquiry_id,
      rating,
      title,
      comment,
      is_verified: true // Auto-verify since inquiry is completed
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
});

// Get reviews for consultant
router.get('/consultant/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: { 
        consultant_id: id,
        is_public: true
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate average rating
    const allReviews = await Review.findAll({
      where: { 
        consultant_id: id,
        is_public: true
      }
    });

    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
        pagination: {
          total: reviews.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(reviews.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get consultant reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
});

module.exports = router;








