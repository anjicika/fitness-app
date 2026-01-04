const WeightEntry = require('../models/weightentry');
const BodyMeasurement = require('../models/bodymeasurement');
const { calculateStatistics } = require('../utils/calculatestatistics');
const { Op } = require('sequelize');

async function getStatistics(req, res) {
  const userId = req.user.id;
  const { metric, type, period = 30, goal } = req.query;

  const periodDays = Number(period) || 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - periodDays);

  // WEIGHT
  if (metric === 'weight') {
    const entries = await WeightEntry.findAll({
      where: {
        user_id: userId,
        measured_at: { [Op.gte]: fromDate }
      },
      order: [['measured_at', 'ASC']]
    });

    const values = entries.map(e => Number(e.weight_kg));
    const stats = calculateStatistics(values, 0.2); // Threshold za weight

    // Percentualna sprememba
    const percentChange = stats.startValue
      ? ((stats.endValue - stats.startValue) / stats.startValue) * 100
      : 0;

    // Goal based progress
    let goalProgress = null;
    if (
      goal &&
      stats.startValue !== null &&
      stats.endValue !== null &&
      Number(goal) !== stats.startValue
    ) {
      const goalValue = Number(goal);
      goalProgress =
        ((stats.endValue - stats.startValue) / (goalValue - stats.startValue)) * 100;
      goalProgress = Math.min(Math.max(goalProgress, 0), 100);
    }

    return res.json({
      metric,
      period: periodDays,
      ...stats,
      percentChange: Number(percentChange.toFixed(2)),
      goalProgress: goalProgress !== null ? Number(goalProgress.toFixed(2)) : null
    });
  }

  // BODY MEASUREMENTS
  if (metric === 'measurement') {
    if (!type) {
      return res.status(400).json({ error: 'Measurement type required' });
    }

    const allowedTypes = ['chest', 'waist', 'hips'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid measurement type' });
    }

    const entries = await BodyMeasurement.findAll({
      where: {
        user_id: userId,
        measured_at: { [Op.gte]: fromDate }
      },
      order: [['measured_at', 'ASC']]
    });

    const values = entries
      .map(e => e[`${type}_cm`])
      .filter(v => v !== null)
      .map(Number);

    const stats = calculateStatistics(values, 0.5); // Threshold za measurement

    // Percentualna sprememba
    const percentChange = stats.startValue
      ? ((stats.endValue - stats.startValue) / stats.startValue) * 100
      : 0;

    // Goal based progress
    let goalProgress = null;
    if (
      goal &&
      stats.startValue !== null &&
      stats.endValue !== null &&
      Number(goal) !== stats.startValue
    ) {
      const goalValue = Number(goal);
      goalProgress =
        ((stats.endValue - stats.startValue) / (goalValue - stats.startValue)) * 100;
      goalProgress = Math.min(Math.max(goalProgress, 0), 100);
    }

    return res.json({
      metric,
      type,
      period: periodDays,
      ...stats,
      percentChange: Number(percentChange.toFixed(2)),
      goalProgress: goalProgress !== null ? Number(goalProgress.toFixed(2)) : null
    });
  }

  return res.status(400).json({ error: 'Invalid metric' });
}

module.exports = { getStatistics };
