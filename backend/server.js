require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth');
const forumRoutes = require('./src/routes/forum');
const metricsRoutes = require('./src/routes/metrics');
const statisticsRoutes = require('./src/routes/statistics');
const nutritionRoutes = require('./src/routes/nutrition');
const aiTrainerRoutes = require('./src/routes/aiTrainer');
const workoutsRoutes = require('./src/routes/workouts');
const exercisesRoutes = require('./src/routes/exercises');
const progressRoutes = require('./src/routes/progress');

const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// debugging ----------
app.use((req, res, next) => {
  console.log(`>>> PREJET ZAHTEVEK: ${req.method} ${req.url}`);
  next();
});
// ---------------------

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logging (only in development)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// HEALTH CHECK ROUTE
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FitnesERI API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

// API Version info
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'FitnesERI API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      workouts: '/api/v1/workouts',
      nutrition: '/api/v1/nutrition',
      coaches: '/api/v1/coaches',
      bookings: '/api/v1/bookings',
      forum: '/api/v1/forum',
      progress: '/api/v1/progress',
      ai: '/api/v1/ai',
    },
  });
});

// Test route
app.get('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working!',
    data: {
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    },
  });
});

// API ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/statistics', statisticsRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/ai-trainer', aiTrainerRoutes);
app.use('/api/v1/workouts', workoutsRoutes);
app.use('/api/v1/exercises', exercisesRoutes);
app.use('/api/v1/progress', progressRoutes);

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
      path: req.path,
      method: req.method,
    },
  });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message,
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// START SERVER (razen če smo v testnem okolju)
async function startServer() {
  try {
    // Preveri povezavo z bazo
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    await sequelize.sync({ alter: true });                                                // <-------------------- ({ alter: true }) change to ({ force: true }) when editing models
    console.log('✅ All database tables synced (BodyMeasurements, WeightEntries, etc.)');

    // Zaženemo server samo, če nismo v testnem okolju
    if (NODE_ENV !== 'test') {
      app.listen(PORT, '0.0.0.0', () => {
        console.log('==========================================');
        console.log('🚀 FITNESSERI BACKEND SERVER');
        console.log('==========================================');
        console.log(`📍 Environment: ${NODE_ENV}`);
        console.log(`🌐 Server running on: http://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
        console.log(`📚 API Base: http://localhost:${PORT}/api/v1`);
        console.log('==========================================');
      });
    }
  } catch (err) {
    console.error('❌ Unable to start server or connect to DB:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app; // Export for tests

