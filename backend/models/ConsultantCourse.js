const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConsultantCourse = sequelize.define('ConsultantCourse', {
  consultant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'consultants',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  }
}, {
  tableName: 'consultant_courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['consultant_id', 'course_id']
    }
  ]
});

module.exports = ConsultantCourse;




