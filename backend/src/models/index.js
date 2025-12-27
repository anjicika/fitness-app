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
const User = require('./user')(sequelize);
const Workout = require('./workout')(sequelize);
const ForumPost = require('./forumpost')(sequelize);

// Associations
User.hasMany(Workout);
Workout.belongsTo(User);

User.hasMany(ForumPost);
ForumPost.belongsTo(User);

module.exports = {
  sequelize,
  Sequelize,
  User,
  Workout,
  ForumPost,
};
