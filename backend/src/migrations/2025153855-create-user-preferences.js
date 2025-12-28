'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_preferences', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'en'
      },
      theme: {
        type: Sequelize.ENUM('light', 'dark', 'system'),
        defaultValue: 'system'
      },
      notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      emailNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      pushNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      unitSystem: {
        type: Sequelize.ENUM('metric', 'imperial'),
        defaultValue: 'metric'
      },
      fitnessGoals: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      privacyLevel: {
        type: Sequelize.ENUM('public', 'friends_only', 'private'),
        defaultValue: 'friends_only'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_preferences');
  }
};