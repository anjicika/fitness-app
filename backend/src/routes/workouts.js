const express = require('express');
const { body, param, validationResult } = require('express-validator');
const models = require('../models');
const { Workout } = models;

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array(),
      },
    });
  }
  next();
};

// GET /api/v1/workouts - List all workouts
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.findAll({
      order: [['date', 'DESC']],
    });
    res.json({
      success: true,
      data: workouts,
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workouts',
      },
    });
  }
});

// GET /api/v1/workouts/:id - Get a single workout
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], handleValidationErrors, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Workout not found',
        },
      });
    }
    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workout',
      },
    });
  }
});

// POST /api/v1/workouts - Create a new workout
router.post('/', [
  body('type').isString().notEmpty().withMessage('Type is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('caloriesBurned').isInt({ min: 0 }).withMessage('Calories burned must be a non-negative integer'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
], handleValidationErrors, async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create workout',
      },
    });
  }
});

// PUT /api/v1/workouts/:id - Update a workout
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('type').optional().isString().notEmpty().withMessage('Type must be a non-empty string'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('caloriesBurned').optional().isInt({ min: 0 }).withMessage('Calories burned must be a non-negative integer'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
], handleValidationErrors, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Workout not found',
        },
      });
    }
    await workout.update(req.body);
    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update workout',
      },
    });
  }
});

// DELETE /api/v1/workouts/:id - Delete a workout
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], handleValidationErrors, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Workout not found',
        },
      });
    }
    await workout.destroy();
    res.json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete workout',
      },
    });
  }
});

module.exports = router;