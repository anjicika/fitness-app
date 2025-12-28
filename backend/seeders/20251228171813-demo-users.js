'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test123!', salt);

    const users = [
      {
        username: 'admin_user',
        email: 'admin@fitnessapp.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'johndoe',
        email: 'john@fitnessapp.com',
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'coach_mark',
        email: 'coach@fitnessapp.com',
        password: hashedPassword,
        role: 'coach',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
    
    // Get the IDs of the created users
    const createdUsers = await queryInterface.sequelize.query(
      `SELECT id, username FROM users WHERE username IN ('admin_user', 'johndoe', 'coach_mark')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create user profiles
    const userProfiles = createdUsers.map(user => ({
      userId: user.id,
      firstName: user.username.split('_')[0],
      lastName: 'Doe',
      bio: 'Fitness enthusiast',
      location: 'Belgrade',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('user_profiles', userProfiles, {});

    // Create user preferences
    const userPreferences = createdUsers.map(user => ({
      userId: user.id,
      theme: 'system',
      language: 'en',
      notifications: true,
      unitSystem: 'metric',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('user_preferences', userPreferences, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_preferences', null, {});
    await queryInterface.bulkDelete('user_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};