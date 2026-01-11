const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coach = sequelize.define(
  'Coach',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    availability: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('availability');
        return value ? JSON.parse(value) : ['morning', 'afternoon', 'evening'];
      },
      set(value) {
        this.setDataValue('availability', JSON.stringify(value));
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'coaches',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Coach;
