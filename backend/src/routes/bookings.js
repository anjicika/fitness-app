const express = require('express');
const { Booking, Coach, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// POST /bookings - Create a new booking
router.post(
  '/',
  authenticate,
  [
    body('coachId').isInt().withMessage('Coach ID must be an integer'),
    body('startTime')
      .isISO8601()
      .withMessage('Start time must be a valid date'),
    body('endTime').isISO8601().withMessage('End time must be a valid date'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { coachId, startTime, endTime, notes } = req.body;

    try {
      // Verify coach exists and is active
      const coach = await Coach.findByPk(coachId);
      if (!coach || !coach.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Coach not found or not available',
        });
      }

      // Check for conflicting bookings
      const conflictingBooking = await Booking.findOne({
        where: {
          coachId,
          status: ['confirmed', 'pending'],
          [require('sequelize').Op.or]: [
            {
              startTime: {
                [require('sequelize').Op.lt]: new Date(endTime),
              },
              endTime: {
                [require('sequelize').Op.gt]: new Date(startTime),
              },
            },
          ],
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          success: false,
          message: 'Time slot is already booked',
        });
      }

      // Create booking
      const booking = await Booking.create({
        userId: req.user.id,
        coachId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price: coach.hourlyRate,
        notes,
        status: 'confirmed', // Auto-confirm for now
      });

      // Return booking with coach details
      const bookingWithDetails = await Booking.findByPk(booking.id, {
        include: [
          {
            model: Coach,
            as: 'Coach',
            attributes: ['id', 'name', 'specialty', 'hourlyRate'],
          },
        ],
      });

      res.status(201).json({
        success: true,
        data: bookingWithDetails,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// GET /bookings/my - Get current user's bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: Coach,
          as: 'Coach',
          attributes: ['id', 'name', 'specialty', 'hourlyRate'],
        },
      ],
      order: [['startTime', 'ASC']],
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// DELETE /bookings/:id - Cancel a booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking belongs to current user
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // Check if booking can be cancelled (not in the past)
    if (new Date(booking.startTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past bookings',
      });
    }

    // Update booking status to cancelled
    await booking.update({
      status: 'cancelled',
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /bookings/coach/:id - Get bookings for a specific coach (for coaches)
router.get('/coach/:id', authenticate, async (req, res) => {
  try {
    const coachId = req.params.id;

    // Verify user is the coach or admin
    const coach = await Coach.findOne({
      where: { userId: req.user.id, id: coachId },
    });

    if (!coach) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these bookings',
      });
    }

    const bookings = await Booking.findAll({
      where: {
        coachId,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['startTime', 'ASC']],
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching coach bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
