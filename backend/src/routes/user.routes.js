const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const rbacMiddleware = require('../middleware/rbac');
const uploadService = require('../services/uploadService');
const { body } = require('express-validator');

// Middleware за аутентификацију
router.use(authMiddleware.authenticate);

// Валидатори
const profileValidation = [
  body('firstName').optional().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isLength({ min: 1, max: 50 }),
  body('bio').optional().isLength({ max: 500 }),
  body('height').optional().isFloat({ min: 50, max: 250 }),
  body('weight').optional().isFloat({ min: 30, max: 300 })
];

const preferencesValidation = [
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('language').optional().isIn(['en', 'sr', 'de', 'fr', 'es']),
  body('unitSystem').optional().isIn(['metric', 'imperial']),
  body('privacyLevel').optional().isIn(['public', 'friends_only', 'private'])
];

// CRUD руте
router.get('/me', userController.getCurrentUser);
router.put('/me', profileValidation, userController.updateProfile);
router.delete('/me', userController.deleteAccount);

// Profile photo руте
router.post(
  '/me/photo',
  uploadService.upload.single('profilePhoto'),
  userController.uploadProfilePhoto
);

// Preferences руте
router.get('/me/preferences', userController.getUserPreferences);
router.put('/me/preferences', preferencesValidation, userController.updatePreferences);

// Public user profiles (RBAC заштићено)
router.get(
  '/:id',
  rbacMiddleware.checkPermission('read', 'user'),
  userController.getUserById
);

// Admin only руте
router.get(
  '/',
  rbacMiddleware.checkRole(['admin']),
  async (req, res) => {
    // Листа свих корисника (само за админе)
  }
);

router.put(
  '/:id/role',
  rbacMiddleware.checkRole(['admin']),
  async (req, res) => {
    // Промена улоге (само за админе)
  }
);

module.exports = router;