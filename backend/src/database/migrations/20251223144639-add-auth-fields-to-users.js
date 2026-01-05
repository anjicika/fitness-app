'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /*
    await queryInterface.addColumn('Users', 'password_hash', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    */
   
    await queryInterface.addColumn('Users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('Users', 'verification_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'password_hash');
    await queryInterface.removeColumn('Users', 'is_verified');
    await queryInterface.removeColumn('Users', 'verification_token');
  },
};
