import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ProgressChart({ workouts }) {
  const [chartType, setChartType] = useState('calories'); // 'calories', 'duration', 'types', 'weekly'

  // Sort workouts by date
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [workouts]);

  // Calories over time
  const calorieData = useMemo(() => {
    return sortedWorkouts.map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: w.caloriesBurned,
      type: w.type,
    }));
  }, [sortedWorkouts]);

  // Duration over time
  const durationData = useMemo(() => {
    return sortedWorkouts.map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: w.duration,
      type: w.type,
    }));
  }, [sortedWorkouts]);

  // Workout types distribution
  const typeData = useMemo(() => {
    const types = {};
    workouts.forEach((w) => {
      types[w.type] = (types[w.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [workouts]);

  // Weekly summary
  const weeklyData = useMemo(() => {
    const weeks = {};
    sortedWorkouts.forEach((w) => {
      const date = new Date(w.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, workouts: 0, calories: 0, duration: 0 };
      }
      weeks[weekKey].workouts += 1;
      weeks[weekKey].calories += w.caloriesBurned;
      weeks[weekKey].duration += w.duration;
    });
    return Object.values(weeks);
  }, [sortedWorkouts]);

  const COLORS = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
  ];

  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 mb-4">No workout data to display</p>
        <p className="text-gray-400 text-sm">Log some workouts to see your progress!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Chart Type Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Progress Analytics</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'calories', label: 'Calories Burned' },
            { id: 'duration', label: 'Workout Duration' },
            { id: 'types', label: 'Workout Types' },
            { id: 'weekly', label: 'Weekly Summary' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setChartType(option.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                chartType === option.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Calories Chart */}
        {chartType === 'calories' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Calories Burned Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  formatter={(value) => `${value} cal`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Duration Chart */}
        {chartType === 'duration' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Workout Duration Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  formatter={(value) => `${value} min`}
                />
                <Legend />
                <Bar dataKey="duration" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Types Distribution */}
        {chartType === 'types' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Workout Types Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} workouts`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly Summary */}
        {chartType === 'weekly' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Summary</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar dataKey="workouts" fill="#10b981" name="Workouts" />
                <Bar dataKey="duration" fill="#3b82f6" name="Duration (min)" />
                <Bar dataKey="calories" fill="#f59e0b" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-semibold">Total Workouts</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{workouts.length}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-semibold">Total Calories</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {workouts.reduce((sum, w) => sum + w.caloriesBurned, 0)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-semibold">Total Duration</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {workouts.reduce((sum, w) => sum + w.duration, 0)} min
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-semibold">Avg per Workout</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {Math.round(workouts.reduce((sum, w) => sum + w.caloriesBurned, 0) / workouts.length)}{' '}
            cal
          </p>
        </div>
      </div>
    </div>
  );
}
