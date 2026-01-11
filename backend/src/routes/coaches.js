const express = require('express');
const { Coach, User, Booking } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /coaches - Get all active coaches
router.get('/', async (req, res) => {
  try {
    const coaches = await Coach.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        }
      ],
      attributes: ['id', 'name', 'specialty', 'bio', 'hourlyRate', 'location', 'rating', 'availability']
    });

    res.json({
      success: true,
      data: coaches
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /coaches/:id - Get specific coach details
router.get('/:id', async (req, res) => {
  try {
    const coach = await Coach.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        }
      ]
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    res.json({
      success: true,
      data: coach
    });
  } catch (error) {
    console.error('Error fetching coach:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /coaches/:id/availability - Get coach availability
router.get('/:id/availability', async (req, res) => {
  try {
    const coach = await Coach.findByPk(req.params.id);
    
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    // Get existing bookings for this coach
    const bookings = await Booking.findAll({
      where: {
        coachId: req.params.id,
        status: ['confirmed', 'pending'],
        startTime: {
          [require('sequelize').Op.gte]: new Date()
        }
      },
      attributes: ['startTime', 'endTime']
    });

    // Generate available slots (mock implementation)
    const availabilityArray = Array.isArray(coach.availability) 
      ? coach.availability 
      : (coach.availability ? JSON.parse(coach.availability) : ['morning', 'afternoon', 'evening']);
    const availableSlots = generateAvailableSlots(availabilityArray, bookings);

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to generate available slots
function generateAvailableSlots(coachAvailability, existingBookings) {
  const slots = [];
  const today = new Date();
  
  // Generate slots for next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends if coach doesn't work weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Saturday, Sunday
    
    // Generate time slots based on coach availability
    const timeSlots = [];
    if (coachAvailability.includes('morning')) {
      timeSlots.push(9, 10, 11); // 9 AM, 10 AM, 11 AM
    }
    if (coachAvailability.includes('afternoon')) {
      timeSlots.push(14, 15, 16); // 2 PM, 3 PM, 4 PM
    }
    if (coachAvailability.includes('evening')) {
      timeSlots.push(17, 18, 19); // 5 PM, 6 PM, 7 PM
    }
    
    timeSlots.forEach(hour => {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(hour + 1, 0, 0, 0);
      
      // Check if slot conflicts with existing bookings
      const isBooked = existingBookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return (startTime >= bookingStart && startTime < bookingEnd) ||
               (endTime > bookingStart && endTime <= bookingEnd) ||
               (startTime <= bookingStart && endTime >= bookingEnd);
      });
      
      if (!isBooked) {
        slots.push({
          id: `slot-${date.toISOString().split('T')[0]}-${hour}`,
          start: startTime.toISOString(),
          end: endTime.toISOString()
        });
      }
    });
  }
  
  return slots;
}

module.exports = router;
