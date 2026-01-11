const User = require('../models/User');
const Workout = require('../models/Workout');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, phone, location, dateOfBirth } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, bio, phone, location, dateOfBirth },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadPhoto = async (req, res) => {
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
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = await Workout.aggregate([
      { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          caloriesBurned: { $sum: '$calories' },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    // Izračun streak-a
    const workouts = await Workout.find({ user: userId })
      .sort({ date: -1 })
      .limit(7);
    
    let currentStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      totalWorkouts: stats[0]?.totalWorkouts || 0,
      caloriesBurned: stats[0]?.caloriesBurned || 0,
      totalDuration: stats[0]?.totalDuration || 0,
      currentStreak
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

exports.getDashboardCharts = async (req, res) => {
  try {
    const userId = req.user.id;
    const range = req.query.range || 'week';
    
    let dateFilter = {};
    const now = new Date();
    
    if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: weekAgo };
    } else if (range === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: monthAgo };
    } else if (range === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: yearAgo };
    }

    // Tedenska aktivnost
    const weeklyActivity = await Workout.aggregate([
      { 
        $match: { 
          user: userId,
          date: dateFilter
        } 
      },
      {
        $group: {
          _id: { $week: "$date" },
          week: { $first: { $week: "$date" } },
          workouts: { $sum: 1 },
          duration: { $sum: "$duration" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Dnevne kalorije (zadnjih 7 dni)
    const dailyCalories = await Workout.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          day: { $first: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
          calories: { $sum: "$calories" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      weeklyActivity: weeklyActivity.map(w => ({ 
        week: `Teden ${w.week}`, 
        workouts: w.workouts, 
        duration: w.duration 
      })),
      dailyCalories: dailyCalories.map(d => ({ 
        day: d.day.split('-')[2], // Samo dan
        calories: d.calories 
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chart data' });
  }
};

module.exports = exports;