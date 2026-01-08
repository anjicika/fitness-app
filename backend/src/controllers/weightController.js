const { WeightEntry } = require('../models');
const { Op } = require('sequelize');

// CREATE: Ustvari novo težo
exports.createWeightEntry = async (req, res) => {
  try {
    const { weight_kg, measured_at } = req.body;
    const userId = req.user.id;

    // Validacija
    if (!weight_kg || isNaN(weight_kg)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Weight in kg is required and must be a number',
        },
      });
    }

    const entry = await WeightEntry.create({
      user_id: userId,
      weight_kg,
      measured_at: measured_at || new Date(),
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Weight entry created successfully',
    });
  } catch (error) {
    console.error('Create weight entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_WEIGHT_ERROR',
        message: 'Failed to create weight entry',
      },
    });
  }
};

// READ: Pridobi vse teže za uporabnika
exports.getUserWeights = async (req, res) => {
  try {
    const userId = req.user.id;

    const weights = await WeightEntry.findAll({
      where: { user_id: userId },
      order: [['measured_at', 'DESC']],
    });

    res.json({
      success: true,
      data: weights,
    });
  } catch (error) {
    console.error('Get user weights error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_WEIGHTS_ERROR',
        message: 'Failed to fetch weight entries',
      },
    });
  }
};

// UPDATE: Posodobi težo
exports.updateWeightEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { weight_kg, measured_at } = req.body;
    const userId = req.user.id;

    const entry = await WeightEntry.findByPk(id);

    if (!entry || entry.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Weight entry not found or not owned by user',
        },
      });
    }

    await entry.update({
      weight_kg: weight_kg !== undefined ? weight_kg : entry.weight_kg,
      measured_at: measured_at || entry.measured_at,
    });

    res.json({
      success: true,
      data: entry,
      message: 'Weight entry updated successfully',
    });
  } catch (error) {
    console.error('Update weight entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_WEIGHT_ERROR',
        message: 'Failed to update weight entry',
      },
    });
  }
};

// DELETE: Izbriši težo
exports.deleteWeightEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await WeightEntry.findByPk(id);

    if (!entry || entry.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Weight entry not found or not owned by user',
        },
      });
    }

    await entry.destroy();

    res.json({
      success: true,
      message: 'Weight entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete weight entry error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_WEIGHT_ERROR',
        message: 'Failed to delete weight entry',
      },
    });
  }
};
