const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  current_education: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  interested_countries: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  interested_courses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  budget_range: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  preferred_intake: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mobile_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: async (student) => {
      // Set name from first_name and last_name if not provided
      if (!student.name && student.first_name) {
        student.name = `${student.first_name} ${student.last_name || ''}`.trim();
      }
    },
    beforeCreate: async (student) => {
      if (student.password_hash) {
        student.password_hash = await bcrypt.hash(student.password_hash, 12);
      }
    },
    beforeUpdate: async (student) => {
      if (student.changed('password_hash')) {
        student.password_hash = await bcrypt.hash(student.password_hash, 12);
      }
      // Update name if first_name or last_name changed
      if (student.changed('first_name') || student.changed('last_name')) {
        student.name = `${student.first_name || ''} ${student.last_name || ''}`.trim();
      }
    }
  }
});

// Instance methods
Student.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

Student.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.verification_token;
  delete values.reset_token;
  delete values.reset_token_expires;
  return values;
};

module.exports = Student;