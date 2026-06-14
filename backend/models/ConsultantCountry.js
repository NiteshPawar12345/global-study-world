const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConsultantCountry = sequelize.define('ConsultantCountry', {
  consultant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'consultants',
      key: 'id'
    }
  },
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id'
    }
  }
}, {
  tableName: 'consultant_countries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['consultant_id', 'country_id']
    }
  ]
});

module.exports = ConsultantCountry;




