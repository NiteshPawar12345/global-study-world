const express = require('express');
const { Consultant, Review } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Search consultants
router.get('/consultants', async (req, res) => {
  try {
    const {
      q,
      country,
      course,
      budget_min,
      budget_max,
      rating_min,
      location,
      sort = 'most-trusted',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { status: 'approved' };
    let orderClause = [['created_at', 'DESC']];

    // Text search
    if (q) {
      whereClause[Op.or] = [
        { agency_name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { contact_person: { [Op.like]: `%${q}%` } }
      ];
    }

    // Country filter
    if (country) {
      whereClause.country = { [Op.like]: `%${country}%` };
    }

    // Course filter
    if (course) {
      whereClause.description = { [Op.like]: `%${course}%` };
    }

    // Budget filter
    if (budget_min) {
      whereClause.fee_max = { [Op.gte]: parseFloat(budget_min) };
    }
    if (budget_max) {
      whereClause.fee_min = { [Op.lte]: parseFloat(budget_max) };
    }

    // Location filter
    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    // Rating filter (simplified - would need complex query with joins)
    if (rating_min) {
      // This would require a more complex query with subqueries
      // For now, we'll implement basic filtering
    }

    // Sorting
    switch (sort) {
      case 'most-trusted':
        orderClause = [
          ['is_verified', 'DESC'],
          ['is_featured', 'DESC'],
          ['total_placements', 'DESC']
        ];
        break;
      case 'lowest-fee':
        orderClause = [['fee_min', 'ASC']];
        break;
      case 'most-experienced':
        orderClause = [['experience_years', 'DESC']];
        break;
      case 'highest-rated':
        // This would need a complex query with average ratings
        orderClause = [['total_placements', 'DESC']];
        break;
    }

    const consultants = await Consultant.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get average ratings for each consultant
    const consultantIds = consultants.rows.map(c => c.id);
    const reviews = await Review.findAll({
      where: {
        consultant_id: { [Op.in]: consultantIds },
        is_public: true
      },
      attributes: ['consultant_id', 'rating']
    });

    // Calculate average ratings
    const ratingsMap = {};
    reviews.forEach(review => {
      if (!ratingsMap[review.consultant_id]) {
        ratingsMap[review.consultant_id] = { sum: 0, count: 0 };
      }
      ratingsMap[review.consultant_id].sum += review.rating;
      ratingsMap[review.consultant_id].count += 1;
    });

    const consultantsWithRatings = consultants.rows.map(consultant => {
      const ratingData = ratingsMap[consultant.id];
      const averageRating = ratingData 
        ? Math.round((ratingData.sum / ratingData.count) * 10) / 10 
        : 0;
      
      return {
        ...consultant.toJSON(),
        averageRating,
        totalReviews: ratingData ? ratingData.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        consultants: consultantsWithRatings,
        pagination: {
          total: consultants.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(consultants.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search consultants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search consultants',
      error: error.message
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const consultants = await Consultant.findAll({
      where: {
        status: 'approved',
        [Op.or]: [
          { agency_name: { [Op.like]: `%${q}%` } },
          { contact_person: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'agency_name', 'contact_person'],
      limit: 10
    });

    const suggestions = consultants.map(consultant => ({
      id: consultant.id,
      text: consultant.agency_name,
      type: 'consultant'
    }));

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

module.exports = router;








