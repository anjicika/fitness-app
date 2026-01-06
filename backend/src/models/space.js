const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Space = sequelize.define(
    'Space', 
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('private_room', 'open_area', 'class_studio', 'boxing_ring', 'cardio_zone'),
      allowNull: false,
      defaultValue: 'private_room'
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 50
      }
    },
    equipment: {
      type: DataTypes.TEXT, // JSON string of equipment
      allowNull: true
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 15.00
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    amenities: {
      type: DataTypes.JSON, // Array of amenities ['mirror', 'sound_system', 'ac', 'shower']
      defaultValue: []
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Spaces',
    timestamps: true, // Adds createdAt and updatedAt
    paranoid: true, // Adds deletedAt for soft deletion
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['type', 'is_active']
      }
    ]
  });

module.exports = Space;