const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

router.get('/', authenticate, progressController.getProgress);
router.get('/:id', authenticate, progressController.getProgressById);
router.post('/', authenticate, progressController.createProgress);
router.put('/:id', authenticate, progressController.updateProgress);
router.delete('/:id', authenticate, progressController.deleteProgress);

module.exports = router;
