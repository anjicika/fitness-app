import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Search, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import WorkoutList from './WorkoutList';
import WorkoutForm from './WorkoutForm';
import ExerciseLibrary from './ExerciseLibrary';
import ProgressChart from './ProgressChart';

export default function Workouts() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'exercises', 'progress'
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all'); // 'all', 'week', 'month'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:3000/api/v1';

  // Fetch workouts
  useEffect(() => {
    fetchWorkouts();
  }, [refreshTrigger]);

  // Apply filters
  useEffect(() => {
    let filtered = [...workouts];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((w) => w.type?.toLowerCase() === filterType.toLowerCase());
    }

    // Filter by date range
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (filterDateRange === 'week') {
      filtered = filtered.filter((w) => new Date(w.date) >= weekAgo);
    } else if (filterDateRange === 'month') {
      filtered = filtered.filter((w) => new Date(w.date) >= monthAgo);
    }

    // Search by description
    if (searchTerm) {
      filtered = filtered.filter((w) =>
        w.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredWorkouts(filtered);
  }, [workouts, filterType, filterDateRange, searchTerm]);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch workouts');
      const data = await res.json();
      setWorkouts(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('list');
  };

  const handleWorkoutDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const workoutTypes = [...new Set(workouts.map((w) => w.type).filter(Boolean))];
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Workout Tracker</h1>
            <p className="text-gray-600">Log your workouts, track progress, and explore exercises</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold">Total Workouts</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{totalWorkouts}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold">Total Duration</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{totalDuration} min</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold">Calories Burned</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">{totalCalories}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-4 px-4 font-semibold transition ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Workouts
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-4 px-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Plus size={18} /> New Workout
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`pb-4 px-4 font-semibold transition ${
                activeTab === 'exercises'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Exercise Library
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-4 px-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'progress'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp size={18} /> Progress
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'list' && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search workouts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    {workoutTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  {/* Date Range Filter */}
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>

                  {/* Reset */}
                  {(searchTerm || filterType !== 'all' || filterDateRange !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                        setFilterDateRange('all');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Workouts List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-4">Loading workouts...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600 font-semibold">{error}</p>
                </div>
              ) : filteredWorkouts.length > 0 ? (
                <WorkoutList
                  workouts={filteredWorkouts}
                  onDelete={handleWorkoutDeleted}
                  token={token}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 mb-4">No workouts found</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Log Your First Workout
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <WorkoutForm onSuccess={handleWorkoutCreated} token={token} />
            </div>
          )}

          {activeTab === 'exercises' && (
            <div>
              <ExerciseLibrary token={token} />
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <ProgressChart workouts={workouts} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
