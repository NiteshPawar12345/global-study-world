const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consultant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'consultant_id']
    },
    {
      fields: ['student_id']
    },
    {
      fields: ['consultant_id']
    },
    {
      fields: ['last_message_at']
    }
  ]
});

module.exports = Conversation;



