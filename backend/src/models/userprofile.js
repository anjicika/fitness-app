// models/userprofile.js
module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfile', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'prefer_not_to_say'),
      allowNull: true
    },
    height: {
      type: DataTypes.FLOAT, // in cm
      allowNull: true
    },
    weight: {
      type: DataTypes.FLOAT, // in kg
      allowNull: true
    },
    profilePhoto: {
      type: DataTypes.STRING, // URL to image in Cloudinary/S3
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'user_profiles',
    timestamps: true
  });
  
  return UserProfile;
};