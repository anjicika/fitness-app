const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const workoutController = require('../controllers/workoutController');

router.get('/', authenticate, workoutController.getWorkouts);
router.get('/:id', authenticate, workoutController.getWorkoutById);
router.post('/', authenticate, workoutController.createWorkout);
router.put('/:id', authenticate, workoutController.updateWorkout);
router.delete('/:id', authenticate, workoutController.deleteWorkout);

module.exports = router;
