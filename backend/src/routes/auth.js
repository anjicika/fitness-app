const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Pot za registracijo: POST http://localhost:3000/api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body; 

    // 1. Preverjanje, ali uporabnik že obstaja
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Uporabnik s tem e-poštnim naslovom že obstaja.' 
      }); 
    }

    // 2. Šifriranje gesla 
    const saltRounds = 10; // 
    const hashedPassword = await bcrypt.hash(password, saltRounds); // 

    // 3. Shranjevanje v bazo 
    const newUser = await User.create({
      name,
      username: email, // Začasna rešitev za ValidationError: User.username cannot be null
      email,
      password: hashedPassword
    }); // 

    // 4. Odgovor o uspehu 
    res.status(201).json({
      success: true,
      message: 'Uporabnik uspešno registriran!',
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email 
      }
    });  

  } catch (error) {
    console.error('Napaka pri registraciji:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Napaka na strežniku pri vpisu v bazo.' 
    });
  }
});

module.exports = router; 