// controllers/statisticsController.js
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

  // WEIGHT STATISTICS
  if (metric === 'weight') {
    try {
      const entries = await WeightEntry.findAll({
        where: {
          user_id: userId,
          measured_at: { [Op.gte]: fromDate },
        },
        order: [['measured_at', 'ASC']],
      });

      const values = entries.map(e => Number(e.weight_kg));
      const stats = calculateStatistics(values, 0.2);

      const percentChange = stats.startValue
        ? ((stats.endValue - stats.startValue) / stats.startValue) * 100
        : 0;

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

      const dataPointsArray = entries.map(e => ({
        date: e.measured_at.toISOString().split('T')[0],
        value: Number(e.weight_kg),
      }));

      return res.json({
        success: true,
        data: {
          metric: 'weight',
          period: periodDays,
          ...stats,
          percentChange: Number(percentChange.toFixed(2)),
          goalProgress: goalProgress !== null ? Number(goalProgress.toFixed(2)) : null,
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

  // BODY MEASUREMENTS STATISTICS
  if (metric === 'measurement') {
    if (!type) {
      return res.status(400).json({ 
        success: false,
        error: 'Measurement type required' 
      });
    }

    const allowedTypes = ['chest', 'waist', 'hips'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid measurement type' 
      });
    }

    try {
      const entries = await BodyMeasurement.findAll({
        where: {
          user_id: userId,
          measured_at: { [Op.gte]: fromDate },
        },
        order: [['measured_at', 'ASC']],
      });

      const values = entries
        .map(e => e[`${type}_cm`])
        .filter(v => v !== null)
        .map(Number);

      const stats = calculateStatistics(values, 0.5);

      const percentChange = stats.startValue
        ? ((stats.endValue - stats.startValue) / stats.startValue) * 100
        : 0;

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

      const dataPointsArray = entries
        .filter(e => e[`${type}_cm`] !== null)
        .map(e => ({
          date: e.measured_at.toISOString().split('T')[0],
          value: Number(e[`${type}_cm`]),
        }));

      return res.json({
        success: true,
        data: {
          metric: 'measurement',
          type,
          period: periodDays,
          ...stats,
          percentChange: Number(percentChange.toFixed(2)),
          goalProgress: goalProgress !== null ? Number(goalProgress.toFixed(2)) : null,
          dataPointsArray,
        },
      });
    } catch (err) {
      console.error('Error fetching measurement statistics:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch measurement statistics',
      });
    }
  }

  // Invalid metric
  return res.status(400).json({ 
    success: false,
    error: 'Invalid metric. Use "weight" or "measurement"' 
  });
}

module.exports = { getStatistics };