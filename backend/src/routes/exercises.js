const express = require('express');
const { body, param, validationResult } = require('express-validator');
const models = require('../models');
const { Exercise } = models;

const router = express.Router();

// Middleware za validacijo napak
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

// GET /api/v1/exercises - List all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.findAll();
    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch exercises',
      },
    });
  }
});

// GET /api/v1/exercises/:id - Get a single exercise
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], handleValidationErrors, async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Exercise not found',
        },
      });
    }
    res.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch exercise',
      },
    });
  }
});

// POST /api/v1/exercises - Create a new exercise
router.post('/', [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('muscleGroups').optional().isArray(),
], handleValidationErrors, async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create exercise',
      },
    });
  }
});

// PUT /api/v1/exercises/:id - Update an exercise
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('muscleGroups').optional().isArray(),
], handleValidationErrors, async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Exercise not found',
        },
      });
    }
    await exercise.update(req.body);
    res.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update exercise',
      },
    });
  }
});

// DELETE /api/v1/exercises/:id - Delete an exercise
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], handleValidationErrors, async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Exercise not found',
        },
      });
    }
    await exercise.destroy();
    res.json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete exercise',
      },
    });
  }
});

module.exports = router;