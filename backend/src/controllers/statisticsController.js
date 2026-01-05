// controllers/statisticsController.js
const WeightEntry = require('../models/weightentry');
const { calculateStatistics } = require('../utils/calculatestatistics');
const { Op } = require('sequelize');

async function getStatistics(req, res) {
  const userId = req.user.id;
  const { period = 30 } = req.query; // še vedno lahko filtriraš obdobje
  const periodDays = Number(period) || 30;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - periodDays);

  try {
    // Pridobi vnose teže za zadnjih periodDays dni
    const entries = await WeightEntry.findAll({
      where: {
        user_id: userId,
        measured_at: { [Op.gte]: fromDate },
      },
      order: [['measured_at', 'ASC']],
    });

    const values = entries.map(e => Number(e.weight_kg));
    const dataPointsArray = entries.map(e => ({
      date: e.measured_at.toISOString().split('T')[0],
      value: Number(e.weight_kg),
    }));

    const stats = calculateStatistics(values, 0.2);

    const percentChange = stats.startValue
      ? ((stats.endValue - stats.startValue) / stats.startValue) * 100
      : 0;

    return res.json({
      success: true,
      data: {
        metric: 'weight',
        period: periodDays,
        ...stats,
        percentChange: Number(percentChange.toFixed(2)),
        dataPointsArray,
      },
    });
  } catch (err) {
    console.error('Error fetching weight statistics:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weight statistics',
    });
  }
}

module.exports = { getStatistics };
