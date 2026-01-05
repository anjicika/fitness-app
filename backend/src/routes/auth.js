const express = require('express');
const { hashPassword, comparePassword } = require('../utils/hashing');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

const NODE_ENV = process.env.NODE_ENV || 'development';

const router = express.Router();

// POST /auth/register
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/\d/)
      .withMessage('Password must contain a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already in use' });
      }

      const password_hash = await hashPassword(password);
      const verification_token = uuidv4();

      const user = await User.create({
        username,
        email,
        password_hash,
        verification_token,
        is_verified: false,
      });

      console.log(
        `Verify your email: http://localhost:3000/api/v1/auth/verify-email?token=${verification_token}`
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
      });


    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
);

// GET /auth/verify-email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ where: { verification_token: token } });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired token' });
    }

    user.is_verified = true;
    user.verification_token = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      if (!user.is_verified) {
        return res.status(400).json({ success: false, message: 'Account not verified yet' });
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      // Generiraj JWT in ga pošlji v JSON
      const token = generateToken({ id: user.id, email: user.email });

      res.json({
        success: true,
        message: 'Login successful',
        token, // <-- token v JSON
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);


// POST /auth/logout
router.post('/logout', (req, res) => {
  // Če token ni v cookie, samo na klientu odstranimo token
  res.json({ success: true, message: 'Logged out successfully' });
});



// GET /auth/me (Get current user info)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id',
        'username',
        'email',
        'is_verified',
        'created_at',
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

module.exports = router;
