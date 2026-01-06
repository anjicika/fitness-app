// test/booking.test.js - WITHOUT AUTH
const request = require('supertest');
const app = require('../server'); // Your Express app
const { Booking, Space, User, sequelize } = require('../src/models');
const { Op } = require('sequelize');

describe('Booking API Tests (No Auth)', () => {
  let testUser;
  let testSpace;
  let testBooking;

  // Setup before all tests
  beforeAll(async () => {
    try {
      console.log('🚀 Setting up test database...');
      
      // Clean the database
      await sequelize.sync({ force: true });
      
      console.log('👤 Creating test user...');
      
      // Create test user
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123', // Simplified for testing
        is_verified: true,
      });
      
      console.log(`✅ Test user created (ID: ${testUser.id})`);
      
      console.log('🏋️  Creating test space...');
      testSpace = await Space.create({
        name: 'Test Yoga Studio',
        type: 'class_studio',
        capacity: 10,
        hourly_rate: 20.00,
        is_active: true,
        amenities: JSON.stringify(['mirrors', 'ac']),
        equipment: JSON.stringify(['yoga_mats', 'blocks']),
        description: 'Test space for booking tests'
      });
      
      console.log(`✅ Test space created (ID: ${testSpace.id})`);
      console.log('🎉 Test setup complete!\n');
      
    } catch (error) {
      console.error('❌ Setup error:', error.message);
      throw error;
    }
  });

  // Cleanup after each test
  afterEach(async () => {
    await Booking.destroy({ where: {} });
  });

  // Cleanup after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  // Test 1: Create a booking
  describe('POST /api/v1/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2026-12-30',
        start_time: '14:00:00',
        end_time: '15:30:00',
        status: 'confirmed',
        duration_hours: 1.5,
        total_price: 30.00
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .send(bookingData)
        .expect(201); // HTTP 201 Created

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.space_id).toBe(testSpace.id);
      expect(response.body.data.user_id).toBe(testUser.id);
      expect(response.body.data.status).toBe('pending');
      
      // Save the booking for later tests
      testBooking = response.body.data;
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/bookings')
        .send({ space_id: testSpace.id }) // Missing user_id and other fields
        .expect(400); // HTTP 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Please provide user_id, space_id, booking_date, start_time, and end_time');
    });

    it('should fail with overlapping booking time', async () => {
      // Create first booking
      await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2026-12-30',
        start_time: '14:00:00',
        end_time: '15:30:00',
        status: 'confirmed',
        duration_hours: 1.5,
        total_price: 30.00
      });

      // Try to create overlapping booking
      const bookingData = {
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2026-12-30',
        start_time: '15:00:00', // Overlaps!
        end_time: '16:30:00',
        notes: 'Overlapping booking'
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .send(bookingData)
        .expect(409); // HTTP 409 Conflict

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already booked');
    });

    it('should fail with invalid time format', async () => {
      const bookingData = {
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2026-12-30',
        start_time: '2:00 PM', // Invalid format
        end_time: '15:30:00',
        notes: 'Test booking'
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Test 2: Get booking by ID
  describe('GET /api/v1/bookings/:id', () => {
    beforeEach(async () => {
      // Create a booking to fetch
      testBooking = await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2024-12-30',
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'confirmed',
        duration_hours: 1.0,
        total_price: 20.00
      });
    });

    it('should get booking by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/${testBooking.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testBooking.id);
      expect(response.body.data.user_id).toBe(testUser.id);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Test 3: Update booking
  describe('PUT /api/v1/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2024-12-30',
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'confirmed',
        duration_hours: 1.0,
        total_price: 20.00
      });
    });

    it('should update booking status', async () => {
      const updateData = {
        status: 'checked_in'
      };

      const response = await request(app)
        .put(`/api/v1/bookings/${testBooking.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('checked_in');
    });
  });

  // Test 4: Delete booking
  describe('DELETE /api/v1/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2024-12-30',
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'confirmed',
        duration_hours: 1.0,
        total_price: 20.00
      });
    });

    it('should cancel a booking', async () => {
      const response = await request(app)
        .delete(`/api/v1/bookings/${testBooking.id}`)
        .send({ cancellation_reason: 'Change of plans' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });
  });

  // Test 5: Check availability
  describe('GET /api/v1/bookings/availability', () => {
    beforeEach(async () => {
      // Create a booking for testing availability
      await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: '2024-12-30',
        start_time: '14:00:00',
        end_time: '15:30:00',
        status: 'confirmed',
        duration_hours: 1.5,
        total_price: 30.00
      });
    });

    it('should check availability successfully', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/availability')
        .query({
          space_id: testSpace.id,
          booking_date: '2024-12-30',
          start_time: '16:00:00', // Different time
          end_time: '17:00:00'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(true);
    });

    it('should show slot as unavailable', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/availability')
        .query({
          space_id: testSpace.id,
          booking_date: '2024-12-30',
          start_time: '14:30:00', // Overlaps
          end_time: '15:00:00'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(false);
    });
  });

  // Test 6: Get upcoming bookings
  describe('GET /api/v1/bookings/upcoming', () => {
    beforeEach(async () => {
      // Create past and future bookings
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Past booking (yesterday)
      await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: yesterday.toISOString().split('T')[0],
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'confirmed',
        duration_hours: 1.0,
        total_price: 20.00
      });

      // Future booking (tomorrow)
      await Booking.create({
        user_id: testUser.id,
        space_id: testSpace.id,
        booking_date: tomorrow.toISOString().split('T')[0],
        start_time: '14:00:00',
        end_time: '15:00:00',
        status: 'confirmed',
        duration_hours: 1.0,
        total_price: 20.00
      });
    });

    it('should return upcoming bookings for a user', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/upcoming')
        .query({ user_id: testUser.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should only return tomorrow's booking (not yesterday's)
      expect(response.body.data).toHaveLength(1);
    });

    it('should fail without user_id parameter', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/upcoming')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});