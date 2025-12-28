const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ForumCategory = sequelize.define(
  'ForumCategory',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#3B82F6',
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    postCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'post_count',
    },
  },
  {
    tableName: 'forum_categories',
    timestamps: false,
  }
);

module.exports = ForumCategory;
