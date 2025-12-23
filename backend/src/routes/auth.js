const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Za unikatne identifierje
const { User } = require('../models');

const router = express.Router();



// POST /auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Preverjanje, če user s tem mailom že obstaja
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const verification_token = uuidv4();

        const user = await User.create({
            username,
            email,
            password_hash,
            verification_token,
        });

        // Verifikacijski link za test, tukaj pride potem dejansko pošiljanje z Nodemailerjem
        console.log(`Verify your email: http://localhost:3000/auth/verify-email?token=${verification_token}`);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /auth/verify-email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ where: { verification_token: token } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.is_verified = true;
        user.verification_token = null;
        await user.save();

        res.json({ message: 'Email verified successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
