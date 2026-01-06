// routes/bookingRoutes.js - WITHOUT AUTH
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// All routes are public (temporarily)

// Check availability
router.get('/availability', bookingController.checkAvailability);

// Create booking
router.post('/', bookingController.createBooking);

// Get user's upcoming bookings (now uses query parameter)
router.get('/upcoming', bookingController.getUpcomingBookings);

// Get all bookings with filters
router.get('/', bookingController.getBookings);

// Get single booking by ID
router.get('/:id', bookingController.getBookingById);

// Update booking
router.put('/:id', bookingController.updateBooking);

// Delete booking
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;