const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const WeightEntry = sequelize.define(
  'WeightEntry',
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
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    measured_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'Weight_entries',
    timestamps: true,
    underscored: true,
  }
);

WeightEntry.belongsTo(User, { foreignKey: 'user_id' });

module.exports = WeightEntry;
