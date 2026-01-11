'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = sequelize => {
    class Progress extends Model {
        static associate(models) { }
    }
    Progress.init(
        {
            date: { type: DataTypes.DATE, allowNull: false },
            weight: DataTypes.FLOAT,
            bodyFat: DataTypes.FLOAT,
            measurements: DataTypes.JSON,
            notes: DataTypes.TEXT,
            userId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'Progress',
        }
    );
    return Progress;
};
