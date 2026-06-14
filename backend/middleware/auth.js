const jwt = require('jsonwebtoken');
const { Student, Consultant, AdminUser } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Verify user exists
    let user;
    if (decoded.userType === 'student') {
      user = await Student.findByPk(decoded.userId);
    } else if (decoded.userType === 'consultant') {
      user = await Consultant.findByPk(decoded.userId);
    } else if (decoded.userType === 'admin') {
      user = await AdminUser.findByPk(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = {
      userId: decoded.userId,
      userType: decoded.userType,
      user: user
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = auth;



