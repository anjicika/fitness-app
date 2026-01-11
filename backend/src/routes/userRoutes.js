const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Дохватање профила
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Ажурирање профила
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, bio },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Отпремање слике профила
router.post('/upload-photo', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();
    }
    
    res.json({ imageUrl: user.profilePicture });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading photo' });
  }
});

// Dashboard статистике
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const stats = await Workout.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          caloriesBurned: { $sum: '$calories' },
          activeDays: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } }
        }
      }
    ]);
    
    const currentStreak = await calculateStreak(req.user.id);
    
    res.json({
      totalWorkouts: stats[0]?.totalWorkouts || 0,
      caloriesBurned: stats[0]?.caloriesBurned || 0,
      activeDays: stats[0]?.activeDays?.length || 0,
      currentStreak
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// Dashboard графикони
router.get('/dashboard/charts', auth, async (req, res) => {
  try {
    // Подаци за недељне активности
    const weeklyData = await Workout.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: { $week: '$date' },
          workouts: { $sum: 1 },
          duration: { $sum: '$duration' }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 8 }
    ]);

    // Подаци за дневне калорије
    const dailyCalories = await Workout.aggregate([
      { $match: { userId: req.user.id, date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          calories: { $sum: '$calories' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      workouts: weeklyData.map(w => ({ week: `Week ${w._id}`, workouts: w.workouts, duration: w.duration })),
      calories: dailyCalories.map(d => ({ day: d._id, calories: d.calories }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chart data' });
  }
});

module.exports = router;