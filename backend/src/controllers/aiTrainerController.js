const aiService = require('../services/aiService');
const { BodyMeasurement, WeightEntry, User } = require('../models');

/**
 * Kontroler za AI Trainer System
 */
exports.generateWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pridobivanje podatkov o uporabniku
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Uporabnik ni najden.' });
    }

    // Preverjanje naročnine
    if (user.tier === 'Basic') {
      return res.status(403).json({
        success: false,
        message: 'Vaša naročnina (Basic) ne vključuje personaliziranih načrtov. Prosimo, nadgradite v Pro ali Premium.',
      });
    }

    // Pridobivanje zadnjih meritev za personalizacijo
    const lastWeight = await WeightEntry.findOne({
      where: { user_id: userId },
      order: [['date', 'DESC']],
    });

    const lastMetrics = await BodyMeasurement.findOne({
      where: { user_id: userId },
      order: [['measured_at', 'DESC']],
    });

    // Priprava podatkov za AI
    const metricsForAI = {
      weight: lastWeight ? lastWeight.weight_kg : 'Ni podatka',
      chest: lastMetrics ? lastMetrics.chest_cm : 'Ni podatka',
      waist: lastMetrics ? lastMetrics.waist_cm : 'Ni podatka',
      hips: lastMetrics ? lastMetrics.hips_cm : 'Ni podatka',
    };

    // Klic AI storitve
    const workoutPlan = await aiService.generatePersonalizedPlan(user, metricsForAI);

    res.status(200).json({
      success: true,
      tier: user.tier,
      data: workoutPlan,
    });
  } catch (error) {
    console.error('AI Trainer Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Prišlo je do napake pri generiranju načrta.',
      error: error.message,
    });
  }
};

/**
 * Hitra AI priporocila, dostopno tudi za Basic uporabnike
 */
exports.getWorkoutRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // Za priporocila ne potrebujemo strogih omejitev, lahko pa prilagodimo dolzino odgovora
    const recommendations = await aiService.getQuickTips(user);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
