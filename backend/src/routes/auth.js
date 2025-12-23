const express = require('express');
const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('Prejeti podatki za registracijo:', req.body);
  
  res.status(200).json({ 
    success: true, 
    message: "Backend je prejel podatke." 
  });
});

module.exports = router;

/*

to je koda ki bo uporabljena ko mergamo

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Preveri, če je pot do modelov v tvojem src pravilna

// Pot za registracijo: POST http://localhost:3000/api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Preverjanje, če uporabnik z istim emailom že obstaja
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Uporabnik s tem e-poštnim naslovom že obstaja.' 
      });
    }

    // 2. Šifriranje gesla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Shranjevanje v Postgres bazo preko Sequelize
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Uporabnik uspešno registriran!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Napaka pri registraciji:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Napaka na strežniku pri vpisu v bazo.' 
    });
  }
});

module.exports = router; */