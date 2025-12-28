const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  async getCurrentUser(req, res, next) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const updatedUser = await userService.updateUserProfile(
        req.user.id, 
        req.body
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadProfilePhoto(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const uploadService = require('../services/uploadService');
      const uploadResult = await uploadService.uploadProfilePhoto(req.file);
      
      await userService.uploadProfilePhoto(req.user.id, uploadResult.url);

      res.json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          photoUrl: uploadResult.url,
          details: uploadResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPreferences(req, res, next) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      res.json({
        success: true,
        data: user.preferences
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const preferences = await userService.updateUserPreferences(
        req.user.id, 
        req.body
      );

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      await userService.deleteUserAccount(req.user.id);
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(
        req.params.id, 
        req.user.id
      );

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();