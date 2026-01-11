const express = require('express');
const router = express.Router();
const aiTrainerController = require('../controllers/aiTrainerController');
const { authenticate } = require('../middleware/auth'); 

router.post('/generate-plan', authenticate, aiTrainerController.generateWorkoutPlan);
router.get('/recommendations', authenticate, aiTrainerController.getWorkoutRecommendations);

module.exports = router;