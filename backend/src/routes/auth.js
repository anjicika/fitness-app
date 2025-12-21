const express = require('express');
const router = express.Router();

// Ta pot bo dostopna na: http://localhost:3000/api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Tukaj bo kasneje prišla logika za shranjevanje v bazo
    console.log("Prejeti podatki za registracijo:", { name, email });

    res.status(201).json({ 
      success: true, 
      message: "Pot za registracijo deluje!",
      data: { name, email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
