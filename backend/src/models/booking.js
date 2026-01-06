const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Make sure this matches your User table name
        key: 'id',
      },
    },
    space_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces', // Make sure this matches your Space table name
        key: 'id',
      },
    },
    booking_date: {
      type: DataTypes.DATEONLY, // Stores only date (YYYY-MM-DD)
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME, // Stores time (HH:MM:SS)
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'checked_in',
        'completed',
        'cancelled',
        'no_show'
      ),
      defaultValue: 'pending',
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    duration_hours: {
      type: DataTypes.DECIMAL(4, 2), // e.g., 1.5, 2.0 hours
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'paid', 'refunded', 'partially_refunded'),
      defaultValue: 'unpaid',
    },
    payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'bookings',
    timestamps: true, // Adds createdAt and updatedAt
    indexes: [
      {
        fields: ['user_id', 'booking_date'],
      },
      {
        fields: ['space_id', 'booking_date', 'start_time'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['booking_date'],
      },
    ],
  }
);

module.exports = Booking;
