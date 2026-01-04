const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const {
  createWeightEntry,
  getUserWeights,
  updateWeightEntry,
  deleteWeightEntry,
} = require('../controllers/weightController');

const {
  createBodyMeasurement,
  getUserMeasurements,
  updateBodyMeasurement,
  deleteBodyMeasurement,
} = require('../controllers/bodyMeasurementController');

// Weight routes
router.post('/weights', authenticate, createWeightEntry);
router.get('/weights', authenticate, getUserWeights);
router.put('/weights/:id', authenticate, updateWeightEntry);
router.delete('/weights/:id', authenticate, deleteWeightEntry);

// Body measurement routes
router.post('/body-measurements', authenticate, createBodyMeasurement);
router.get('/body-measurements', authenticate, getUserMeasurements);
router.put('/body-measurements/:id', authenticate, updateBodyMeasurement);
router.delete('/body-measurements/:id', authenticate, deleteBodyMeasurement);

module.exports = router;
