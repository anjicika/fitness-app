
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');

// Pot za registracijo: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Šifriranje gesla
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Uporabnik uspešno ustvarjen!", user: { id: newUser.id, name: newUser.name } });
  } catch (error) {
    res.status(400).json({ error: "Napaka pri registraciji: " + error.message });
  }
});

module.exports = router;