'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = sequelize => {
    class Exercise extends Model {
        static associate(models) {
            // associations can be defined here
        }
    }
    Exercise.init(
        {
            name: { type: DataTypes.STRING, allowNull: false },
            description: DataTypes.TEXT,
            category: DataTypes.STRING,
            muscleGroups: DataTypes.JSON,
        },
        {
            sequelize,
            modelName: 'Exercise',
        }
    );
    return Exercise;
};
