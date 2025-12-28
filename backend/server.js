require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// DATABASE CONNECTION
// ==========================================
let sequelize;
let testConnection;
try {
  const db = require('./src/config/database.js');
  sequelize = db.sequelize;
  testConnection = db.testConnection;
  
  // Test connection to the database on startup
  testConnection();
} catch (error) {
  console.log('Database configuration not found or error:', error.message);
  console.log('Starting server without database connection...');
}

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ==========================================
// BODY PARSING
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON validation middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload',
        details: 'The request contains malformed JSON'
      }
    });
  }
  next();
});

// ==========================================
// PERFORMANCE MIDDLEWARE
// ==========================================
app.use(compression());

// ==========================================
// RATE LIMITING
// ==========================================
const userCrudLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  }
});

// ==========================================
// LOGGING
// ==========================================
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom logging for CRUD operations
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log requests for User API
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (req.path.startsWith('/api/v1/users')) {
      console.log(`USER API ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
    
    // Detailed logging for CRUD operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && 
        req.path.startsWith('/api/v1/users')) {
      console.log(`RUD Operation: ${req.method} ${req.path}`);
      if (NODE_ENV === 'development' && Object.keys(req.body).length > 0) {
        console.log('   Body:', JSON.stringify(req.body, null, 2));
      }
    }
  });
  
  next();
});

// ==========================================
// HEALTH AND INFO ROUTES
// ==========================================
app.get('/health', async (req, res) => {
  const healthStatus = {
    success: true,
    message: 'FitnesERI API is running',
    service: 'backend',
    environment: NODE_ENV,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
    }
  };
  
  // Add database status if exists
  if (sequelize) {
    try {
      await sequelize.authenticate();
      healthStatus.database = {
        status: 'connected',
        dialect: sequelize.options.dialect,
        database: sequelize.config.database
      };
    } catch (error) {
      healthStatus.database = {
        status: 'disconnected',
        error: error.message
      };
    }
  }
  
  res.status(200).json(healthStatus);
});

app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'FitnesERI API v1',
    version: '1.0.0',
    environment: NODE_ENV,
    currentTask: '2.4 User Management API',
    endpoints: {
      health: '/health',
      apiInfo: '/api/v1',
      userManagement: {
        currentUser: 'GET /api/v1/users/me',
        updateProfile: 'PUT /api/v1/users/me',
        uploadPhoto: 'POST /api/v1/users/me/photo',
        userPreferences: 'GET /api/v1/users/me/preferences',
        updatePreferences: 'PUT /api/v1/users/me/preferences',
        deleteAccount: 'DELETE /api/v1/users/me',
        getUserById: 'GET /api/v1/users/:id'
      }
    },
    status: 'operational',
    documentation: 'See GitHub Wiki for API documentation'
  });
});

// ==========================================
// DEVELOPMENT ROUTES
// ==========================================
// Temporary endpoints until full controllers are implemented
app.get('/api/v1/users/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile endpoint',
    section: '2.4 User Management API',
    note: 'This is a development endpoint. Real implementation will include:',
    features: [
      'Get current user profile with all details',
      'Include profile photo URL',
      'Include user preferences',
      'Include subscription status',
      'Role-based data filtering'
    ],
    implementationStatus: 'in_development',
    estimatedCompletion: '6 hours (Task 2.4)'
  });
});

app.put('/api/v1/users/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile update endpoint',
    section: '2.4 User Management API',
    note: 'This endpoint will handle:',
    operations: [
      'Update basic profile information',
      'Validate input data',
      'Handle profile photo updates separately',
      'Apply role-based validation rules',
      'Return updated user object'
    ],
    requestExample: {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Fitness enthusiast',
      location: 'Maribor'
    }
  });
});

app.delete('/api/v1/users/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Account deletion endpoint',
    section: '2.4 User Management API',
    warning: 'This will permanently delete user account and all associated data',
    note: 'Implementation will include:',
    features: [
      'Soft delete (mark as inactive)',
      'Confirmation requirement',
      'Cascade deletion of related data',
      'Grace period for account recovery'
    ]
  });
});

// Profile photo upload
app.post('/api/v1/users/me/photo', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile photo upload endpoint',
    section: '2.4 User Management API',
    integration: 'Cloudinary / AWS S3',
    features: [
      'Image validation (size, type)',
      'Automatic resizing and optimization',
      'Secure URL generation',
      'Multiple image format support'
    ],
    maxFileSize: '5MB',
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  });
});

// User preferences
app.get('/api/v1/users/me/preferences', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User preferences endpoint',
    section: '2.4 User Management API',
    preferences: {
      theme: ['light', 'dark', 'system'],
      language: ['en', 'sr', 'de', 'si'],
      unitSystem: ['metric'],
      notifications: {
        email: 'boolean',
        push: 'boolean',
        workoutReminders: 'boolean'
      },
      privacy: {
        level: ['public', 'friends_only', 'private'],
        profileVisibility: 'boolean',
        activitySharing: 'boolean'
      }
    }
  });
});

app.put('/api/v1/users/me/preferences', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update user preferences endpoint',
    section: '2.4 User Management API',
    note: 'Partial updates are supported',
    exampleRequest: {
      theme: 'dark',
      language: 'si',
      notifications: {
        email: true,
        push: false
      }
    }
  });
});

// Route for testing all CRUD operations
app.get('/api/v1/users/test-all', userCrudLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User Management API Test Suite',
    section: '2.4 - Complete CRUD Operations',
    endpoints: [
      { method: 'GET', path: '/api/v1/users/me', description: 'Get current user' },
      { method: 'PUT', path: '/api/v1/users/me', description: 'Update user profile' },
      { method: 'DELETE', path: '/api/v1/users/me', description: 'Delete account' },
      { method: 'POST', path: '/api/v1/users/me/photo', description: 'Upload profile photo' },
      { method: 'GET', path: '/api/v1/users/me/preferences', description: 'Get preferences' },
      { method: 'PUT', path: '/api/v1/users/me/preferences', description: 'Update preferences' },
      { method: 'GET', path: '/api/v1/users/:id', description: 'Get user by ID (public)' }
    ],
    features: [
      'Role-based Access Control (RBAC)',
      'Profile photo upload to Cloudinary/S3',
      'User preferences management',
      'Input validation and sanitization',
      'Rate limiting protection',
      'Comprehensive error handling'
    ],
    status: 'ready_for_implementation'
  });
});

// ==========================================
// Real routes (TO DO: Implement in future tasks)
// ==========================================
/*
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const uploadRoutes = require('./src/routes/upload');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userCrudLimiter, userRoutes);
app.use('/api/v1/uploads', uploadRoutes);
*/

// ==========================================
// IMPORT AND MOUNT ROUTES
// ==========================================
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const uploadRoutes = require('./src/routes/upload.routes');

try {
  if (fs.existsSync(path.join(__dirname, 'src/routes/user.routes.js'))) {
    app.use('/api/v1/users', userCrudLimiter, userRoutes);
    console.log('User routes loaded');
  }
  
  if (fs.existsSync(path.join(__dirname, 'src/routes/auth.routes.js'))) {
    app.use('/api/v1/auth', authRoutes);
    console.log('Auth routes loaded');
  }
  
  if (fs.existsSync(path.join(__dirname, 'src/routes/upload.routes.js'))) {
    app.use('/api/v1/uploads', uploadRoutes);
    console.log('Upload routes loaded');
  }
} catch (error) {
  console.log('Some routes not available:', error.message);
}
// ==========================================
// ERROR HANDLING
// ==========================================
// 404 Handler
app.use((req, res) => {
  const userApiEndpoints = [
    'GET  /api/v1/users/me           - Get current user profile',
    'PUT  /api/v1/users/me           - Update profile',
    'DELETE /api/v1/users/me         - Delete account',
    'POST /api/v1/users/me/photo     - Upload profile photo',
    'GET  /api/v1/users/me/preferences - Get preferences',
    'PUT  /api/v1/users/me/preferences - Update preferences',
    'GET  /api/v1/users/test-all     - Test all User API endpoints'
  ];
  
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
      currentTask: '2.4 User Management API Development',
      availableUserEndpoints: userApiEndpoints,
      suggestion: 'Check /api/v1/users/test-all for available endpoints'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  if (NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack);
    console.error('Request details:', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  const statusCode = err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  
  const errorResponse = {
    success: false,
    error: {
      code: err.code || (isClientError ? 'CLIENT_ERROR' : 'SERVER_ERROR'),
      message: err.message || 'Internal Server Error',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  };

  if (NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
});

// ==========================================
// START SERVER
// ==========================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.clear();
  console.log('='.repeat(50));
  console.log('FITNESERI BACKEND - SECTION 2.4 IMPLEMENTATION');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`API Info: http://localhost:${PORT}/api/v1`);
  console.log('─'.repeat(50));
  console.log('USER MANAGEMENT API (Section 2.4)');
  console.log('─'.repeat(50));
  console.log('GET  /api/v1/users/me           - Current user profile');
  console.log('PUT  /api/v1/users/me           - Update profile');
  console.log('DEL  /api/v1/users/me           - Delete account');
  console.log('POST /api/v1/users/me/photo     - Upload profile photo');
  console.log('GET  /api/v1/users/me/preferences - User preferences');
  console.log('PUT  /api/v1/users/me/preferences - Update preferences');
  console.log('GET  /api/v1/users/test-all     - Test all endpoints');
  console.log('='.repeat(50));
  console.log('Server started successfully!');
  console.log('='.repeat(50));
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received, starting graceful shutdown...`);
  
  // 1. Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // 2. Close database connection if exists
  if (sequelize) {
    try {
      await sequelize.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error.message);
    }
  }
  
  // 3. Exit process
  setTimeout(() => {
    console.log('Graceful shutdown complete');
    process.exit(0);
  }, 1000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});