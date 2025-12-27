'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      // what associations? define here
    }
  }
  Progress.init(
    {
      date: DataTypes.DATE,
      weight: DataTypes.FLOAT,
      bodyFat: DataTypes.FLOAT,
      measurements: DataTypes.JSON, // e.g., { chest: 40, waist: 32, blabla }
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Progress',
    }
  );
  return Progress;
};