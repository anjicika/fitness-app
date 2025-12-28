const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const uploadService = require('../services/uploadService');
const userService = require('../services/userService');

// Only authenticated users can upload
router.use(authMiddleware.authenticate);

// Endpoint for uploading profile photo
router.post('/profile', uploadService.upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Assume uploadService.upload.single uses Cloudinary under the hood
    const photoUrl = req.file.path; // Cloudinary returns the file URL in req.file.path
    
    await userService.uploadProfilePhoto(req.user.id, photoUrl);

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        url: photoUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add more upload endpoints if needed
router.post('/workout', uploadService.upload.single('image'), (req, res) => {

});

module.exports = router;