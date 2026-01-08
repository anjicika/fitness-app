const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const WeightEntry = sequelize.define(
  'WeightEntry',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    measured_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: 'WeightEntries',
    timestamps: true,
    underscored: true,
  }
);

module.exports = WeightEntry;
