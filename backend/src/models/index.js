const { sequelize, Sequelize } = require('../config/database');

// Models
const User = require('./user');
const Workout = require('./workout')(sequelize);
const ForumPost = require('./forumpost');
const Comment = require('./comment');
const ForumCategory = require('./forumcategory');
const PostLike = require('./postlike');
const WeightEntry = require('./weightentry');
const BodyMeasurement = require('./bodymeasurement');
const Exercise = require('./exercise')(sequelize);
const Progress = require('./progress')(sequelize);

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

User.hasMany(WeightEntry, { foreignKey: 'user_id' });
WeightEntry.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(BodyMeasurement, { foreignKey: 'user_id' });
BodyMeasurement.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Progress);
Progress.belongsTo(User);

// Exercises are standalone for now

module.exports = {
  sequelize,
  Sequelize,
  User,
  Workout,
  ForumPost,
  Comment,
  ForumCategory,
  PostLike,
  WeightEntry,
  BodyMeasurement,
  Exercise,
  Progress,
};
