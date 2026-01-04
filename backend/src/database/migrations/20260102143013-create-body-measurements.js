'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Body_measurements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      chest_cm: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      waist_cm: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      hips_cm: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      measured_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('Body_measurements', [
      'user_id',
      'measured_at',
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Body_measurements');
  },
};
