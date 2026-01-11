import React, { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';

export default function WorkoutList({ workouts, onDelete, token }) {
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const API_URL = 'http://localhost:3000/api/v1';

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/workouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      onDelete();
    } catch (err) {
      console.error('Error deleting workout:', err);
      alert('Failed to delete workout');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
        >
          <div
            className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800">{workout.type}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {workout.duration} min
                </span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  {workout.caloriesBurned} cal
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(workout.date)} at {formatTime(workout.date)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChevronDown
                size={20}
                className={`text-gray-400 transition ${
                  expandedId === workout.id ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === workout.id && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {workout.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{workout.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Duration</p>
                  <p className="text-lg font-bold text-blue-600">{workout.duration} min</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Calories</p>
                  <p className="text-lg font-bold text-orange-600">{workout.caloriesBurned}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Type</p>
                  <p className="text-lg font-bold text-purple-600">{workout.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Intensity</p>
                  <p className="text-lg font-bold text-green-600">
                    {workout.intensity || 'Moderate'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(workout.id)}
                  disabled={deleting === workout.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  {deleting === workout.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
