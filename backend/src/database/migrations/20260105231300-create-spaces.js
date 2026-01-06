'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('spaces', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.ENUM('private_room', 'open_area', 'class_studio', 'boxing_ring', 'cardio_zone'),
        allowNull: false,
        defaultValue: 'private_room'
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      equipment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 15.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('spaces', ['name'], {
      unique: true,
      name: 'spaces_name_unique_idx'
    });

    await queryInterface.addIndex('spaces', ['type', 'is_active'], {
      name: 'spaces_type_active_idx'
    });

    await queryInterface.addIndex('spaces', ['is_active'], {
      name: 'spaces_active_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('spaces');
  }
};