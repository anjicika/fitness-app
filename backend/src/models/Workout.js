const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workout = sequelize.define('Workout', {
  name: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Workout;
