require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Uporaa DATABASE_URL namesto posameznih polj
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const db = {};
const User = require('./User');

if (User.init) {
    User.init(User.rawAttributes || {}, { 
        sequelize, 
        modelName: 'User' 
    });
}

db.User = User;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;