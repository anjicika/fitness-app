const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ForumPost = sequelize.define(
  'ForumPost',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 10000],
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'forum_categories',
        key: 'id',
      },
    },
    tags: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_pinned',
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_locked',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'forum_posts',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ForumPost;
