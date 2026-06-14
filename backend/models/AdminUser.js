const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  profile_picture: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'moderator'),
    defaultValue: 'admin'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'admin_users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['username']
    },
    {
      fields: ['email']
    },
    {
      fields: ['reset_token']
    }
  ]
});

// Hash password before saving
AdminUser.beforeCreate(async (admin) => {
  if (admin.password_hash) {
    admin.password_hash = await bcrypt.hash(admin.password_hash, 12);
  }
});

AdminUser.beforeUpdate(async (admin) => {
  if (admin.changed('password_hash')) {
    admin.password_hash = await bcrypt.hash(admin.password_hash, 12);
  }
});

// Instance method to validate password
AdminUser.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Instance method to generate reset token
AdminUser.prototype.generateResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.reset_token = token;
  this.reset_token_expires = new Date(Date.now() + 3600000); // 1 hour
  return token;
};

// Instance method to clear reset token
AdminUser.prototype.clearResetToken = function() {
  this.reset_token = null;
  this.reset_token_expires = null;
};

module.exports = AdminUser;





