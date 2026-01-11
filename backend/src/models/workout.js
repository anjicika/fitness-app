'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = sequelize => {
  class Workout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Workout.init(
    {
      type: DataTypes.STRING,
      description: DataTypes.TEXT,
      duration: DataTypes.INTEGER,
      caloriesBurned: DataTypes.INTEGER,
      intensity: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Workout',
    }
  );
  return Workout;
};
