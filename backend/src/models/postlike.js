const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostLike = sequelize.define(
  'PostLike',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'post_id',
      references: {
        model: 'forum_posts',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'post_likes',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['post_id', 'user_id'],
      },
    ],
  }
);

module.exports = PostLike;
