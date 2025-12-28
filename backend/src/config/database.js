const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // TEST ENV – brez Dockerja, brez Postgresa
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
  });
} else {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: 30000,
      idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
