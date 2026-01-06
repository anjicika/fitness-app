'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Your existing users table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      space_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'spaces', // Your existing spaces table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      booking_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'),
        defaultValue: 'pending'
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      duration_hours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'refunded', 'partially_refunded'),
        defaultValue: 'unpaid'
      },
      payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
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
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('bookings', ['user_id', 'booking_date'], {
      name: 'bookings_user_date_idx'
    });

    await queryInterface.addIndex('bookings', ['space_id', 'booking_date', 'start_time'], {
      name: 'bookings_space_datetime_idx'
    });

    await queryInterface.addIndex('bookings', ['status'], {
      name: 'bookings_status_idx'
    });

    await queryInterface.addIndex('bookings', ['booking_date'], {
      name: 'bookings_date_idx'
    });

    await queryInterface.addIndex('bookings', ['payment_status'], {
      name: 'bookings_payment_status_idx'
    });

    // Add composite unique constraint to prevent double bookings
    await queryInterface.addIndex('bookings', [
      'space_id', 
      'booking_date', 
      'start_time', 
      'end_time'
    ], {
      unique: true,
      name: 'bookings_unique_booking_idx',
      where: {
        status: ['pending', 'confirmed', 'checked_in'] // Only enforce for active bookings
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bookings');
  }
};