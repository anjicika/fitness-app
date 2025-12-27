// models/userpreferences.js
module.exports = (sequelize, DataTypes) => {
  const UserPreferences = sequelize.define('UserPreferences', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
      validate: {
        isIn: [['en', 'sr', 'de', 'fr', 'es']]
      }
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'system'),
      defaultValue: 'system'
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    unitSystem: {
      type: DataTypes.ENUM('metric'),
      defaultValue: 'metric'
    },
    fitnessGoals: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    privacyLevel: {
      type: DataTypes.ENUM('public', 'friends_only', 'private'),
      defaultValue: 'friends_only'
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true
  });
  
  return UserPreferences;
};