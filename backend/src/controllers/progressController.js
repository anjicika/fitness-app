const { Progress } = require('../models');

exports.getProgress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const where = userId ? { userId } : {};
        const progress = await Progress.findAll({ where, order: [['date', 'DESC']] });
        res.json({ success: true, data: progress });
    } catch (err) {
        next(err);
    }
};

exports.getProgressById = async (req, res, next) => {
    try {
        const item = await Progress.findByPk(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Progress entry not found' } });
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

exports.createProgress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { date, weight, bodyFat, measurements, notes } = req.body;
        const item = await Progress.create({ date, weight, bodyFat, measurements, notes, userId });
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

exports.updateProgress = async (req, res, next) => {
    try {
        const item = await Progress.findByPk(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Progress entry not found' } });
        await item.update(req.body);
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
};

exports.deleteProgress = async (req, res, next) => {
    try {
        const item = await Progress.findByPk(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Progress entry not found' } });
        await item.destroy();
        res.json({ success: true, message: 'Progress entry deleted' });
    } catch (err) {
        next(err);
    }
};
