const { Workout } = require('../models');

exports.getWorkouts = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const where = userId ? { userId } : {};
        const workouts = await Workout.findAll({ where, order: [['date', 'DESC']] });
        res.json({ success: true, data: workouts });
    } catch (err) {
        next(err);
    }
};

exports.getWorkoutById = async (req, res, next) => {
    try {
        const workout = await Workout.findByPk(req.params.id);
        if (!workout) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workout not found' } });
        res.json({ success: true, data: workout });
    } catch (err) {
        next(err);
    }
};

exports.createWorkout = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { type, duration, caloriesBurned, date, description, intensity } = req.body;
        const workout = await Workout.create({ type, duration, caloriesBurned, date, description, intensity, userId });
        res.status(201).json({ success: true, data: workout });
    } catch (err) {
        next(err);
    }
};

exports.updateWorkout = async (req, res, next) => {
    try {
        const workout = await Workout.findByPk(req.params.id);
        if (!workout) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workout not found' } });
        await workout.update(req.body);
        res.json({ success: true, data: workout });
    } catch (err) {
        next(err);
    }
};

exports.deleteWorkout = async (req, res, next) => {
    try {
        const workout = await Workout.findByPk(req.params.id);
        if (!workout) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workout not found' } });
        await workout.destroy();
        res.json({ success: true, message: 'Workout deleted' });
    } catch (err) {
        next(err);
    }
};
