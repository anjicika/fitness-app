'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exercise extends Model {
    static associate(models) {
      //  ker se zdaj exercises upostevajo kot independent library
      //  Exercise.belongsTo(models.Workout, { foreignKey: 'workoutId' });
      // Exercise.belongsToMany(models.Workout, { through: 'WorkoutExercises' });
      // lahk neki takega implementirate da workouts majo many to many relationship 
    }
  }
  Exercise.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      category: DataTypes.STRING,
      muscleGroups: DataTypes.JSON, // array stringov
    },
    {
      sequelize,
      modelName: 'Exercise',
    }
  );
  return Exercise;
};