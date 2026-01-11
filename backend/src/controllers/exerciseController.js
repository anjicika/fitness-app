const { Exercise } = require('../models');

exports.getExercises = async (req, res, next) => {
    try {
        const exercises = await Exercise.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: exercises });
    } catch (err) {
        next(err);
    }
};

exports.getExerciseById = async (req, res, next) => {
    try {
        const exercise = await Exercise.findByPk(req.params.id);
        if (!exercise) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found' } });
        res.json({ success: true, data: exercise });
    } catch (err) {
        next(err);
    }
};

exports.createExercise = async (req, res, next) => {
    try {
        const { name, description, category, muscleGroups } = req.body;
        const exercise = await Exercise.create({ name, description, category, muscleGroups });
        res.status(201).json({ success: true, data: exercise });
    } catch (err) {
        next(err);
    }
};

exports.updateExercise = async (req, res, next) => {
    try {
        const exercise = await Exercise.findByPk(req.params.id);
        if (!exercise) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found' } });
        await exercise.update(req.body);
        res.json({ success: true, data: exercise });
    } catch (err) {
        next(err);
    }
};

exports.deleteExercise = async (req, res, next) => {
    try {
        const exercise = await Exercise.findByPk(req.params.id);
        if (!exercise) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found' } });
        await exercise.destroy();
        res.json({ success: true, message: 'Exercise deleted' });
    } catch (err) {
        next(err);
    }
};
