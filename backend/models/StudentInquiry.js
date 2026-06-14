const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentInquiry = sequelize.define('StudentInquiry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  consultant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'consultants',
      key: 'id'
    }
  },
  requested_consultant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'consultants',
      key: 'id'
    }
  },
  country_preference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  course_preference: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  budget_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  budget_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  timeline: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  additional_requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current_education: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  english_proficiency: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  work_experience: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'student_inquiries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['consultant_id']
    },
    {
      fields: ['requested_consultant_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = StudentInquiry;






