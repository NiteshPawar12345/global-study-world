const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Consultant = sequelize.define('Consultant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  agency_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
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
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  profile_picture: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 50
    }
  },
  total_placements: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  success_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  response_time_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
    validate: {
      min: 1,
      max: 168
    }
  },
  fee_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  fee_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  fee_model: {
    type: DataTypes.ENUM('fixed', 'percentage'),
    defaultValue: 'fixed'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  destination_countries: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  courses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  gst_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  nda_accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'suspended', 'rejected'),
    defaultValue: 'pending'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_documents: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'consultants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_verified']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: async (consultant) => {
      if (consultant.password_hash) {
        consultant.password_hash = await bcrypt.hash(consultant.password_hash, 12);
      }
    },
    beforeUpdate: async (consultant) => {
      if (consultant.changed('password_hash')) {
        consultant.password_hash = await bcrypt.hash(consultant.password_hash, 12);
      }
    }
  }
});

// Instance methods
Consultant.prototype.validatePassword = async function(password) {
  if (!this.password_hash) return false;
  return await bcrypt.compare(password, this.password_hash);
};

Consultant.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.verification_documents;
  delete values.bank_details;
  return values;
};

module.exports = Consultant;




