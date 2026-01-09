const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for AI endpoints to prevent API cost overruns
 * Limits: 10 requests per 15 minutes per IP
 */
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per window per IP
  message: {
    success: false,
    error:
      'Too many AI requests from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip rate limiting for admin users (if you have admin role)
    return req.user?.role === 'admin';
  },
});

/**
 * General API rate limiter (less restrictive)
 * Limits: 100 requests per 15 minutes per IP
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  aiRateLimiter,
  generalRateLimiter,
};