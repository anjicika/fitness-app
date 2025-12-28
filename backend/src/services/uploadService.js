const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Конфигурација Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
  constructor() {
    this.storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'fitnesseri/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      }
    });
    
    this.upload = multer({ 
      storage: this.storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: this.fileFilter
    });
  }

  fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.mimetype.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }

  async uploadProfilePhoto(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'fitnesseri/profiles',
        transformation: [
          { width: 500, height: 500, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async deletePhoto(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}

module.exports = new UploadService();