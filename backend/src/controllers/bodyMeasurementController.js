const { BodyMeasurement, User } = require('../models');
const { Op } = require('sequelize');

// CREATE: Ustvari novo meritev
exports.createBodyMeasurement = async (req, res) => {
  try {
    const { chest_cm, waist_cm, hips_cm, measured_at } = req.body;
    const userId = req.user.id;

    const entry = await BodyMeasurement.create({
      user_id: userId,
      chest_cm: chest_cm || null,
      waist_cm: waist_cm || null,
      hips_cm: hips_cm || null,
      measured_at: measured_at || new Date(),
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Body measurement created successfully',
    });
  } catch (error) {
    console.error('Create body measurement error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_BODY_MEASUREMENT_ERROR',
        message: 'Failed to create body measurement',
      },
    });
  }
};

// READ: Pridobi vse meritve trenutnega uporabnika
exports.getUserMeasurements = async (req, res) => {
  try {
    const userId = req.user.id;

    const entries = await BodyMeasurement.findAll({
      where: { user_id: userId },
      order: [['measured_at', 'DESC']],
    });

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Get body measurements error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BODY_MEASUREMENTS_ERROR',
        message: 'Failed to fetch body measurements',
      },
    });
  }
};

// UPDATE: Posodobi meritev
exports.updateBodyMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { chest_cm, waist_cm, hips_cm, measured_at } = req.body;
    const userId = req.user.id;

    const entry = await BodyMeasurement.findByPk(id);

    if (!entry || entry.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Body measurement not found or not owned by user',
        },
      });
    }

    await entry.update({
      chest_cm: chest_cm !== undefined ? chest_cm : entry.chest_cm,
      waist_cm: waist_cm !== undefined ? waist_cm : entry.waist_cm,
      hips_cm: hips_cm !== undefined ? hips_cm : entry.hips_cm,
      measured_at: measured_at || entry.measured_at,
    });

    res.json({
      success: true,
      data: entry,
      message: 'Body measurement updated successfully',
    });
  } catch (error) {
    console.error('Update body measurement error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_BODY_MEASUREMENT_ERROR',
        message: 'Failed to update body measurement',
      },
    });
  }
};

// DELETE: Izbriši meritev
exports.deleteBodyMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await BodyMeasurement.findByPk(id);

    if (!entry || entry.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Body measurement not found or not owned by user',
        },
      });
    }

    await entry.destroy();

    res.json({
      success: true,
      message: 'Body measurement deleted successfully',
    });
  } catch (error) {
    console.error('Delete body measurement error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_BODY_MEASUREMENT_ERROR',
        message: 'Failed to delete body measurement',
      },
    });
  }
};
