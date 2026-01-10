// frontend/src/components/BodyMeasurementTracker.jsx
import React, { useState, useEffect } from 'react';
import {
  getBodyMeasurements,
  addBodyMeasurement,
  deleteBodyMeasurement,
  updateBodyMeasurement,
} from '../api/metrics';

export default function BodyMeasurementTracker() {
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState({ chest_cm: '', waist_cm: '', hips_cm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Inline editing ---
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    measured_at: '',
  });

  // --- History and filters ---
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // --- Fetch measurements ---
  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await getBodyMeasurements();
      
      // Tvoj krmilnik vrne { success: true, data: entries }
      if (res && res.success && Array.isArray(res.data)) {
        // Podatke razvrstimo, da so najnovejši na vrhu za seznam
        const sortedData = res.data.sort((a, b) => 
          new Date(b.measured_at) - new Date(a.measured_at)
        );
        setMeasurements(sortedData);
      } else {
        console.error("Neznan format odgovora:", res);
        setError('Napak pri nalaganju meritev');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Napaka pri povezavi s strežnikom');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  // --- Add measurement ---
  const handleAddMeasurement = async () => {
    const { chest_cm, waist_cm, hips_cm } = form;
    
    // Osnovno preverjanje na frontendu
    if (!chest_cm || !waist_cm || !hips_cm) {
      setError('Prosim izpolni vsa polja');
      return;
    }

    try {
      const res = await addBodyMeasurement({
        chest_cm: parseFloat(chest_cm),
        waist_cm: parseFloat(waist_cm),
        hips_cm: parseFloat(hips_cm),
        // Pošljemo ISO niz ali pa pustimo undefined, da krmilnik uporabi new Date()
        measured_at: new Date().toISOString() 
      });

      if (res.success) {
        setMeasurements(prev => [res.data, ...prev]);
        setForm({ chest_cm: '', waist_cm: '', hips_cm: '' });
        setError('');
      } else {
        setError(res.error?.message || 'Napaka pri shranjevanju');
      }
    } catch (err) {
      setError('Strežniška napaka');
    }
  };

  // --- Delete measurement ---
  const handleDeleteMeasurement = async (id) => {
    try {
      const res = await deleteBodyMeasurement(id);
      if (res.success) {
        setMeasurements(measurements.filter((m) => m.id !== id));
      } else {
        setError(res.message || 'Error deleting measurement');
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting measurement');
    }
  };

  // --- Handle input changes ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEditChange = (e) => {
    setEditingForm({ ...editingForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    const { chest_cm, waist_cm, hips_cm, measured_at } = editingForm;
    if (!chest_cm || !waist_cm || !hips_cm || !measured_at) {
      setError('Please fill all fields');
      return;
    }

    try {
      const res = await updateBodyMeasurement(editingId, {
        chest_cm: parseFloat(chest_cm),
        waist_cm: parseFloat(waist_cm),
        hips_cm: parseFloat(hips_cm),
        measured_at: new Date(measured_at),
      });

      if (res.success) {
        setMeasurements(measurements.map((m) => (m.id === editingId ? res.data : m)));
        setEditingId(null);
        setEditingForm({ chest_cm: '', waist_cm: '', hips_cm: '', measured_at: '' });
        setError('');
      } else {
        setError(res.message || 'Error updating measurement');
      }
    } catch (err) {
      console.error(err);
      setError('Error updating measurement');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingForm({ chest_cm: '', waist_cm: '', hips_cm: '', measured_at: '' });
    setError('');
  };

  // --- Prepare displayed measurements ---
  const displayedMeasurements = showFullHistory
    ? measurements.filter((m) => {
        if (historyFilter === 'all') return true;
        const days = parseInt(historyFilter, 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return new Date(m.measured_at) >= cutoff;
      })
    : measurements.slice(0, 5);

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Body Measurements</h2>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

      {/* Add new measurement */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="number"
          name="chest_cm"
          placeholder="Chest cm"
          value={form.chest_cm}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="number"
          name="waist_cm"
          placeholder="Waist cm"
          value={form.waist_cm}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="number"
          name="hips_cm"
          placeholder="Hips cm"
          value={form.hips_cm}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <button
        onClick={handleAddMeasurement}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-4"
      >
        Add
      </button>

      {/* Measurement list */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : displayedMeasurements.length === 0 ? (
        <p className="text-center text-gray-400">No body measurements yet.</p>
      ) : (
        <ul className="space-y-2">
          {displayedMeasurements.map((m) => (
            <li
              key={m.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center px-3 py-2 border rounded hover:bg-gray-50"
            >
              {editingId === m.id ? (
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <input
                    type="number"
                    name="chest_cm"
                    value={editingForm.chest_cm}
                    onChange={handleEditChange}
                    className="px-2 py-1 border rounded w-20 flex-shrink-0"
                  />
                  <input
                    type="number"
                    name="waist_cm"
                    value={editingForm.waist_cm}
                    onChange={handleEditChange}
                    className="px-2 py-1 border rounded w-20 flex-shrink-0"
                  />
                  <input
                    type="number"
                    name="hips_cm"
                    value={editingForm.hips_cm}
                    onChange={handleEditChange}
                    className="px-2 py-1 border rounded w-20 flex-shrink-0"
                  />
                  <input
                    type="date"
                    name="measured_at"
                    value={editingForm.measured_at}
                    onChange={handleEditChange}
                    className="px-2 py-1 border rounded w-32 flex-shrink-0"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between w-full items-center">
                  <span>
                    {new Date(m.measured_at).toLocaleDateString()} – Chest: {m.chest_cm} cm, Waist:{' '}
                    {m.waist_cm} cm, Hips: {m.hips_cm} cm
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setEditingForm({
                          chest_cm: m.chest_cm,
                          waist_cm: m.waist_cm,
                          hips_cm: m.hips_cm,
                          measured_at: new Date(m.measured_at).toISOString().split('T')[0],
                        });
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteMeasurement(m.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
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
