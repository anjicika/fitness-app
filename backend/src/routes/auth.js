const express = require('express');
const { hashPassword, comparePassword } = require('../utils/hashing');
const { v4: uuidv4 } = require('uuid'); // Za unikatne identifierje
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

const router = express.Router();



// POST /auth/register
router.post('/register',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
            .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
            .matches(/\d/).withMessage('Password must contain a number')
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
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }

            const password_hash = await hashPassword(password);
            const verification_token = uuidv4();

            const user = await User.create({
                username,
                email,
                password_hash,
                verification_token,
            });

            console.log(
                `Verify your email: http://localhost:3000/api/v1/auth/verify-email?token=${verification_token}`
            );

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_verified: user.is_verified,
                },
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });



// GET /auth/verify-email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ where: { verification_token: token } });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
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

            const password_match = await comparePassword(password, user.password_hash);
            if (!password_match) {
                return res.status(400).json({ success: false, message: 'Invalid email or password' });
            }

            if (!user.is_verified) {
                return res.status(403).json({ success: false, message: 'Email not verified' });
            }

            const token = generateToken({ id: user.id, email: user.email });
            res.json({ success: true, token });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
);



// POST /auth/logout
router.post('/logout', (req, res) => {
    // Nič se ne shranjuje na backendu, frontend bo pobrisal JWT
    res.json({ success: true, message: 'Logout successful' });
});


module.exports = router;