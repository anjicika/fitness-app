const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const BodyMeasurement = sequelize.define(
  'BodyMeasurement',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chest_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    waist_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    hips_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    measured_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Body_measurements',
    timestamps: true,
    underscored: true,
  }
);

BodyMeasurement.belongsTo(User, { foreignKey: 'user_id' });

module.exports = BodyMeasurement;
