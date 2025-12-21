const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');
const Workout = require('../models/Workout');

// DEFINICIJA RELACIJ
User.hasMany(Workout, { foreignKey: 'userId', onDelete: 'CASCADE' });
Workout.belongsTo(User, { foreignKey: 'userId' });

const runMigration = async () => {
  try {
    await testConnection();
    console.log('Posodabljam tabele in relacije');
    await sequelize.sync({ alter: true }); 
    console.log('Relacije so vzpostavljene!');
    process.exit(0);
  } catch (error) {
    console.error('Napaka:', error.message);
    process.exit(1);
  }
};

runMigration();