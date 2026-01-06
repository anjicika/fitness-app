// src/controllers/bookingController.js - WITHOUT TRANSACTIONS
const { Booking, Space, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Public (Temporarily)
 */
const createBooking = async (req, res) => {
  try {
    // TEMPORARY: Accept user_id from request body instead of req.user
    const { user_id, space_id, booking_date, start_time, end_time, notes } = req.body;

    console.log('📥 Received booking request1:', { user_id, space_id, booking_date, start_time, end_time, notes });
    console.log('📊 Types:', { 
      user_id_type: typeof user_id, 
      space_id_type: typeof space_id, 
      booking_date_type: typeof booking_date,
      start_time_type: typeof start_time,
      end_time_type: typeof end_time
    });
    
    // Input validation - use loose equality check for null/undefined
    if (user_id == null || space_id == null || booking_date == null || 
        start_time == null || end_time == null) {
      console.log('❌ Validation failed. Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide user_id, space_id, booking_date, start_time, and end_time'
      });
    }
    
    console.log('✅ All required fields present');

    // Validate user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if space exists and is active
    const space = await Space.findOne({
      where: { id: space_id, is_active: true }
    });

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found or not available'
      });
    }

    // Validate date format
    const bookingDate = new Date(booking_date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking date format. Use YYYY-MM-DD'
      });
    }

    // Check if booking date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      });
    }

    // Validate time format and calculate duration
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM:SS (24-hour format)'
      });
    }

    // Parse times
    const start = new Date(`1970-01-01T${start_time}`);
    const end = new Date(`1970-01-01T${end_time}`);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check if booking is within business hours (8 AM - 10 PM)
    if (start.getHours() < 8 || end.getHours() > 22 || 
        (end.getHours() === 22 && end.getMinutes() > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Bookings allowed only between 8:00 AM and 10:00 PM'
      });
    }

    // Calculate duration in hours
    const duration_hours = (end - start) / (1000 * 60 * 60);
    
    // Check minimum booking duration (30 minutes)
    if (duration_hours < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'Minimum booking duration is 30 minutes'
      });
    }

    // Check maximum booking duration (4 hours)
    if (duration_hours > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum booking duration is 4 hours'
      });
    }

    // Check for overlapping bookings (without transaction)
    const overlappingBooking = await Booking.findOne({
      where: {
        space_id,
        booking_date,
        status: {
          [Op.in]: ['pending', 'confirmed', 'checked_in']
        },
        [Op.or]: [
          {
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time }
          }
        ]
      }
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked',
        conflicting_booking: {
          id: overlappingBooking.id,
          start_time: overlappingBooking.start_time,
          end_time: overlappingBooking.end_time
        }
      });
    }

    // Calculate total price
    const total_price = (space.hourly_rate * duration_hours).toFixed(2);

    // Create booking (without transaction)
    const booking = await Booking.create({
      user_id,  // Use user_id from request body
      space_id,
      booking_date,
      start_time,
      end_time,
      duration_hours,
      total_price,
      notes: notes || null,
      status: 'pending',
      payment_status: 'unpaid'
    });

    // Get booking with space and user details
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'type', 'hourly_rate']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: bookingWithDetails
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update a booking
 * @route   PUT /api/bookings/:id
 * @access  Public (Temporarily)
 */
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, notes, check_in_time, check_out_time } = req.body;

    // Find booking
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate update based on current status
    const currentStatus = booking.status;
    
    // Check if booking can be updated
    if (currentStatus === 'cancelled' || currentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${currentStatus} booking`
      });
    }

    // Prepare updates
    const updates = {};
    
    // Handle status changes
    if (status) {
      // Validate status transition
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['checked_in', 'cancelled'],
        checked_in: ['completed'],
        completed: [],
        cancelled: []
      };

      if (!validTransitions[currentStatus].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${currentStatus} to ${status}`
        });
      }

      // Special handling for cancellation
      if (status === 'cancelled') {
        updates.status = 'cancelled';
        updates.cancelled_at = new Date();
        updates.cancellation_reason = req.body.cancellation_reason || 'User cancelled';
      } else {
        updates.status = status;
      }
    }

    // Handle check-in/check-out
    if (check_in_time && currentStatus === 'confirmed') {
      updates.status = 'checked_in';
      updates.check_in_time = new Date();
    }

    if (check_out_time && currentStatus === 'checked_in') {
      updates.status = 'completed';
      updates.check_out_time = new Date();
      updates.payment_status = 'paid';
    }

    // Update notes if provided
    if (notes !== undefined) {
      updates.notes = notes;
    }

    // Apply updates
    await booking.update(updates);

    // Get updated booking with details
    const updatedBooking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete/Cancel a booking
 * @route   DELETE /api/bookings/:id
 * @access  Public (Temporarily)
 */
const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { cancellation_reason } = req.body;

    // Find booking
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled/deleted
    const currentStatus = booking.status;
    if (['completed', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete a ${currentStatus} booking`
      });
    }

    // Calculate time until booking
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);

    // Apply cancellation policy
    let refundStatus = 'unpaid';
    if (booking.payment_status === 'paid') {
      if (hoursUntilBooking >= 24) {
        refundStatus = 'refunded';
      } else {
        refundStatus = 'partially_refunded';
      }
    }

    // Update booking as cancelled
    await booking.update({
      status: 'cancelled',
      payment_status: refundStatus,
      cancelled_at: new Date(),
      cancellation_reason: cancellation_reason || 'User cancelled booking'
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        id: booking.id,
        status: 'cancelled',
        payment_status: refundStatus,
        cancellation_reason: cancellation_reason || 'User cancelled booking'
      }
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all bookings (with filters)
 * @route   GET /api/bookings
 * @access  Public (Temporarily)
 */
const getBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      space_id, 
      user_id, 
      start_date, 
      end_date,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Build where clause
    const where = {};

    // Apply filters
    if (user_id) {
      where.user_id = user_id;
    }

    if (status) {
      where.status = Array.isArray(status) ? { [Op.in]: status } : status;
    }

    if (space_id) {
      where.space_id = space_id;
    }

    // Date range filter
    if (start_date || end_date) {
      where.booking_date = {};
      if (start_date) where.booking_date[Op.gte] = start_date;
      if (end_date) where.booking_date[Op.lte] = end_date;
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate sort parameters
    const validSortFields = ['created_at', 'booking_date', 'start_time', 'total_price'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    // Get bookings with pagination
    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'type', 'hourly_rate', 'image_url']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      attributes: { 
        exclude: ['deletedAt'] 
      },
      order: [[sortField, sortDir]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Public (Temporarily)
 */
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'type', 'capacity', 'hourly_rate', 'amenities', 'image_url', 'description']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Check availability for a space
 * @route   GET /api/bookings/availability
 * @access  Public
 */
const checkAvailability = async (req, res) => {
  try {
    const { space_id, booking_date, start_time, end_time, exclude_booking_id } = req.query;

    if (!space_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide space_id, booking_date, start_time, and end_time'
      });
    }

    // Check if space exists and is active
    const space = await Space.findOne({
      where: { id: space_id, is_active: true }
    });

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found or not available'
      });
    }

    // Build where clause for overlapping bookings
    const where = {
      space_id,
      booking_date,
      status: {
        [Op.in]: ['pending', 'confirmed', 'checked_in']
      },
      [Op.or]: [
        {
          start_time: { [Op.lt]: end_time },
          end_time: { [Op.gt]: start_time }
        }
      ]
    };

    // Exclude a specific booking (useful for updates)
    if (exclude_booking_id) {
      where.id = { [Op.ne]: exclude_booking_id };
    }

    const conflictingBookings = await Booking.findAll({
      where,
      attributes: ['id', 'start_time', 'end_time', 'status']
    });

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        space: {
          id: space.id,
          name: space.name,
          hourly_rate: space.hourly_rate
        },
        requested_slot: {
          date: booking_date,
          start_time,
          end_time
        },
        conflicting_bookings: conflictingBookings,
        message: isAvailable 
          ? 'Time slot is available' 
          : 'Time slot is already booked'
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get user's upcoming bookings
 * @route   GET /api/bookings/upcoming
 * @access  Public (Temporarily)
 */
const getUpcomingBookings = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user_id as query parameter'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const upcomingBookings = await Booking.findAll({
      where: {
        user_id: user_id,
        booking_date: { [Op.gte]: today },
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      include: [
        {
          model: Space,
          as: 'space',
          attributes: ['id', 'name', 'type', 'image_url', 'hourly_rate']
        }
      ],
      order: [
        ['booking_date', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: upcomingBookings
    });

  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching upcoming bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBooking,
  updateBooking,
  deleteBooking,
  getBookings,
  getBookingById,
  checkAvailability,
  getUpcomingBookings
};