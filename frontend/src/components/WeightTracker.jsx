import React, { useState, useEffect } from 'react';
import { getWeights, addWeight, deleteWeight, updateWeight } from '../api/metrics';

export default function WeightTracker() {
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Za inline urejanje
  const [editingId, setEditingId] = useState(null);
  const [editingWeight, setEditingWeight] = useState('');
  const [editingDate, setEditingDate] = useState('');

  // Za zgodovino in filtre
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // --- Fetch weights ---
  const fetchWeights = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getWeights();
      
      // Preveri, ali so podatki v res.data ali direktno v res
      const actualData = res.success ? res.data : (Array.isArray(res) ? res : null);

      if (actualData && Array.isArray(actualData)) {
        setWeights(actualData.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at)));
      } else {
        // Če ni podatkov, ne vrži napake, samo nastavi prazno
        setWeights([]); 
        if (res.error) setError(res.message || 'Error fetching weights');
      }
    } catch (err) {
      console.error(err);
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  // --- Add weight ---
  const handleAddWeight = async () => {
    setError('');
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight (positive number)');
      return;
    }

    try {
      const res = await addWeight(parseFloat(weightNum.toFixed(1))); // Ena decimalka
      if (res.success) {
        setWeights([res.data, ...weights]);
        setNewWeight('');
      } else {
        setError(res.message || 'Error adding weight');
      }
    } catch (err) {
      console.error(err);
      setError('Error adding weight');
    }
  };

  // --- Delete weight ---
  const handleDeleteWeight = async (id) => {
    try {
      const res = await deleteWeight(id);
      if (res.success) {
        setWeights(weights.filter((w) => w.id !== id));
      } else {
        setError(res.message || 'Error deleting weight');
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting weight');
    }
  };

  // --- Prepare displayed weights ---
  const displayedWeights = showFullHistory
    ? weights.filter((w) => {
        if (historyFilter === 'all') return true;
        const days = parseInt(historyFilter, 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return new Date(w.measured_at) >= cutoff;
      })
    : weights.slice(0, 5);

  // --- Render ---
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Weight</h2>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

      {/* Add new weight */}
      <div className="flex mb-4 gap-2">
        <input
          type="number"
          placeholder="Weight kg"
          value={newWeight}
          step="0.1"
          min="0"
          onChange={(e) => setNewWeight(e.target.value)}
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={handleAddWeight}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Add
        </button>
      </div>

      {/* Weight list */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : displayedWeights.length === 0 ? (
        <p className="text-center text-gray-400">No weight entries yet.</p>
      ) : (
        <ul className="space-y-2">
          {displayedWeights.map((w) => (
            <li
              key={w.id}
              className="flex justify-between items-center px-3 py-2 border rounded hover:bg-gray-50"
            >
              {editingId === w.id ? (
                // --- Inline edit ---
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={editingWeight}
                      step="0.1"
                      min="0"
                      onChange={(e) => setEditingWeight(e.target.value)}
                      className="px-2 py-1 border rounded w-20"
                    />
                    <input
                      type="date"
                      value={editingDate}
                      onChange={(e) => setEditingDate(e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={async () => {
                        setError('');
                        const weightNum = parseFloat(editingWeight);
                        if (isNaN(weightNum) || weightNum <= 0) {
                          setError('Please enter a valid weight (positive number)');
                          return;
                        }

                        const res = await updateWeight(
                          w.id,
                          parseFloat(weightNum.toFixed(1)),
                          new Date(editingDate)
                        );

                        if (res.success) {
                          setWeights(weights.map((item) => (item.id === w.id ? res.data : item)));
                          setEditingId(null);
                        } else {
                          setError(res.message || 'Error updating weight');
                        }
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1">
                    {w.weight_kg} kg – {new Date(w.measured_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(w.id);
                        setEditingWeight(w.weight_kg);
                        setEditingDate(new Date(w.measured_at).toISOString().split('T')[0]);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteWeight(w.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Full history button and filters */}
      <div className="mt-4 flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFullHistory(!showFullHistory)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showFullHistory ? 'Show Last 5' : 'Show Full History'}
        </button>

        {showFullHistory && (
          <>
            <button
              onClick={() => setHistoryFilter('7')}
              className={`px-3 py-1 rounded ${
                historyFilter === '7' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setHistoryFilter('30')}
              className={`px-3 py-1 rounded ${
                historyFilter === '30' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setHistoryFilter('90')}
              className={`px-3 py-1 rounded ${
                historyFilter === '90' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Last 90 days
            </button>
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-3 py-1 rounded ${
                historyFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              All
            </button>
          </>
        )}
      </div>
    </div>
  );
}
