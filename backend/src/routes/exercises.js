const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const exerciseController = require('../controllers/exerciseController');

router.get('/', authenticate, exerciseController.getExercises);
router.get('/:id', authenticate, exerciseController.getExerciseById);
router.post('/', authenticate, exerciseController.createExercise);
router.put('/:id', authenticate, exerciseController.updateExercise);
router.delete('/:id', authenticate, exerciseController.deleteExercise);

module.exports = router;
