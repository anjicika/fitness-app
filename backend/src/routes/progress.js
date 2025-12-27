const express = require('express');
const { body, param, validationResult } = require('express-validator');
const models = require('../models');
const { Progress } = models;

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

// GET /api/v1/progress - List all progress entries
router.get('/', async (req, res) => {
  try {
    const progress = await Progress.findAll({
      order: [['date', 'DESC']],
    });
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch progress',
      },
    });
  }
});

// GET /api/v1/progress/:id - Get a single progress entry
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], handleValidationErrors, async (req, res) => {
  try {
    const progress = await Progress.findByPk(req.params.id);
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Progress entry not found',
        },
      });
    }
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch progress',
      },
    });
  }
});

// POST /api/v1/progress - Create a new progress entry
router.post('/', [
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('weight').optional().isFloat({ min: 0 }),
  body('bodyFat').optional().isFloat({ min: 0, max: 100 }),
  body('measurements').optional().isObject(),
  body('notes').optional().isString(),
], handleValidationErrors, async (req, res) => {
  try {
    const progress = await Progress.create(req.body);
    res.status(201).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error creating progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create progress',
      },
    });
  }
});

// PUT /api/v1/progress/:id - Update a progress entry
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('weight').optional().isFloat({ min: 0 }),
  body('bodyFat').optional().isFloat({ min: 0, max: 100 }),
  body('measurements').optional().isObject(),
  body('notes').optional().isString(),
], handleValidationErrors, async (req, res) => {
  try {
    const progress = await Progress.findByPk(req.params.id);
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Progress entry not found',
        },
      });
    }
    await progress.update(req.body);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update progress',
      },
    });
  }
});

// DELETE /api/v1/progress/:id - Delete a progress entry
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
], handleValidationErrors, async (req, res) => {
  try {
    const progress = await Progress.findByPk(req.params.id);
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Progress entry not found',
        },
      });
    }
    await progress.destroy();
    res.json({
      success: true,
      message: 'Progress entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete progress',
      },
    });
  }
});

module.exports = router;