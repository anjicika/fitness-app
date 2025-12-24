const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Za unikatne identifierje
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

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
        // Validacija vhodnih podatkov
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // Preverjanje, če uporabnik že obstaja
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            // Hashiranje gesla
            const password_hash = await bcrypt.hash(password, 10);

            // Generiranje verifikacijskega tokena
            const verification_token = uuidv4();

            // Ustvarjanje novega uporabnika
            const user = await User.create({
                username,
                email,
                password_hash,
                verification_token,
            });

            // Pošiljanje verifikacijskega linka
            console.log(
                `Verify your email: http://localhost:3000/api/v1/auth/verify-email?token=${verification_token}`
            );

            res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

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
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Zaenkrat brez JWT, samo test za delovanje
    res.json({ success: true, message: `Welcome ${user.username}!` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



module.exports = router;