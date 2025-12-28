const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: config.dialect,
      logging: false, // Ugasne logging v testih
    })
  : new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: env === 'development' ? console.log : false,
    });

// Models
const User = require('./user');
const Workout = require('./workout')(sequelize);
const ForumPost = require('./forumpost');
const Comment = require('./comment');
const ForumCategory = require('./forumcategory');
const PostLike = require('./postlike');

// Associations
User.hasMany(Workout);
Workout.belongsTo(User);

ForumPost.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
ForumPost.belongsTo(ForumCategory, {
  foreignKey: 'categoryId',
  as: 'category',
});
ForumPost.hasMany(PostLike, { foreignKey: 'postId', as: 'postLikes' });

Comment.belongsTo(ForumPost, { foreignKey: 'postId', as: 'post' });
Comment.hasMany(Comment, { foreignKey: 'parentCommentId', as: 'replies' });
Comment.belongsTo(Comment, {
  foreignKey: 'parentCommentId',
  as: 'parentComment',
});

ForumCategory.hasMany(ForumPost, { foreignKey: 'categoryId', as: 'posts' });
PostLike.belongsTo(ForumPost, { foreignKey: 'postId', as: 'post' });

User.hasMany(ForumPost);
ForumPost.belongsTo(User);

module.exports = {
  sequelize,
  Sequelize,
  User,
  Workout,
  ForumPost,
  Comment,
  ForumCategory,
  PostLike,
};
