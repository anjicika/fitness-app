require('dotenv').config();
const { Sequelize } = require('sequelize');
const { runSeeds } = require('./seeds');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/fitnesseri');

async function runAllSeeds() {
  try {
    console.log('Running database seeds...');
    await sequelize.sync();
    await runSeeds();
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runAllSeeds();
}

module.exports = { runAllSeeds };