/*
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    #
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     #
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
*/
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // associations defined here
      User.hasOne(models.UserProfile, {
        foreignKey: 'userId',
        as: 'profile',
        onDelete: 'CASCADE'
      });
      
      User.hasOne(models.UserPreferences, {
        foreignKey: 'userId',
        as: 'preferences',
        onDelete: 'CASCADE'
      });
      
      User.hasMany(models.Workout, {
        foreignKey: 'userId',
        as: 'workouts'
      });
      
      User.hasMany(models.Meal, {
        foreignKey: 'userId',
        as: 'meals'
      });
      
      User.hasMany(models.ForumPost, {
        foreignKey: 'userId',
        as: 'forumPosts'
      });
      
      User.hasMany(models.CoachBooking, {
        foreignKey: 'userId',
        as: 'bookings'
      });
      
      // If the user is a coach, link to Coach profile
      User.hasOne(models.Coach, {
        foreignKey: 'userId',
        as: 'coachProfile'
      });
    }
    
    // Password validation method
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
    
    // JWT data generator
    toAuthJSON() {
      return {
        id: this.id,
        username: this.username,
        email: this.email,
        role: this.role,
        isPremium: this.isPremium,
        isEmailVerified: this.isEmailVerified
      };
    }

    // Method for getting public profile
    toPublicJSON() {
      return {
        id: this.id,
        username: this.username,
        profile: this.profile ? {
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          bio: this.profile.bio,
          profilePhoto: this.profile.profilePhoto
        } : null,
        role: this.role,
        createdAt: this.createdAt
      };
    }
  }
  
  User.init(
    {
      // Basic auth info
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 30],
          is: /^[a-zA-Z0-9_]+$/ // Only alphanumeric and underscores
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 100]
        }
      },
      
      // Role and status
      role: {
        type: DataTypes.ENUM('user', 'premium_user', 'coach', 'admin'),
        defaultValue: 'user',
        allowNull: false
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      premiumExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      
      // Security fields
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true, // Allows for soft deletes
      defaultScope: {
        attributes: {
          exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 
                   'passwordResetExpires', 'loginAttempts', 'lockUntil']
        }
      },
      scopes: {
        withSecurityData: {
          attributes: { include: ['loginAttempts', 'lockUntil'] }
        },
        withSensitiveData: {
          attributes: { include: ['password', 'emailVerificationToken'] }
        },
        forAuth: {
          attributes: ['id', 'username', 'email', 'password', 'role', 
                      'isPremium', 'isEmailVerified', 'isActive']
        }
      },
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
          
          // Generate email verification token
          if (!user.emailVerificationToken) {
            user.emailVerificationToken = require('crypto')
              .randomBytes(32)
              .toString('hex');
          }
        },
        beforeUpdate: async (user) => {
          // Update password if changed
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      },
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          unique: true,
          fields: ['username']
        },
        {
          fields: ['role']
        },
        {
          fields: ['isPremium']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['createdAt']
        }
      ]
    }
  );
  
  // Static methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };
  
  User.findByUsername = function(username) {
    return this.findOne({ where: { username } });
  };
  
  // Check if account is locked
  User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > new Date());
  };
  
  // Increment login attempts
  User.prototype.incrementLoginAttempts = async function() {
    const updates = { loginAttempts: this.loginAttempts + 1 };
    
    if (this.loginAttempts + 1 >= 5) {
      updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }
    
    return await this.update(updates);
  };
  
  // Reset login attempts
  User.prototype.resetLoginAttempts = async function() {
    return await this.update({
      loginAttempts: 0,
      lockUntil: null
    });
  };
  
  // Check if user has a specific role
  User.prototype.hasRole = function(role) {
    return this.role === role;
  };
  
  // Check if user has any of the given roles
  User.prototype.hasAnyRole = function(roles) {
    return roles.includes(this.role);
  };
  
  // Check if user is admin
  User.prototype.isAdmin = function() {
    return this.role === 'admin';
  };
  
  // Check if user is coach
  User.prototype.isCoach = function() {
    return this.role === 'coach';
  };
  
  // Check if user is premium
  User.prototype.isPremiumUser = function() {
    return this.isPremium && (!this.premiumExpiresAt || this.premiumExpiresAt > new Date());
  };
  
  return User;
};