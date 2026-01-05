// frontend/src/components/BodyMeasurementTracker.jsx
import React, { useState, useEffect } from 'react';
import { getBodyMeasurements, addBodyMeasurement, deleteBodyMeasurement } from '../api/metrics';

export default function BodyMeasurementTracker() {
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState({ chest: '', waist: '', hips: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pridobi telesne mere
  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const res = await getBodyMeasurements();
      if (res.success) {
        setMeasurements(res.data.slice(0, 5)); // zadnjih 5
      } else {
        setError(res.message || 'Error fetching measurements');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error fetching measurements');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  // Dodaj meritev
  const handleAddMeasurement = async () => {
    const { chest, waist, hips } = form;
    if (!chest || !waist || !hips) {
      setError('Please fill all fields');
      return;
    }

    try {
      const res = await addBodyMeasurement({
        chest: parseFloat(chest),
        waist: parseFloat(waist),
        hips: parseFloat(hips),
      });
      if (res.success) {
        setMeasurements([res.data, ...measurements].slice(0, 5));
        setForm({ chest: '', waist: '', hips: '' });
        setError('');
      } else {
        setError(res.message || 'Error adding measurement');
      }
    } catch (err) {
      console.error(err);
      setError('Error adding measurement');
    }
  };

  // Izbriši meritev
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

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Body Measurements</h2>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

      {/* Dodajanje meritev */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="number"
          name="chest"
          placeholder="Chest cm"
          value={form.chest}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="number"
          name="waist"
          placeholder="Waist cm"
          value={form.waist}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="number"
          name="hips"
          placeholder="Hips cm"
          value={form.hips}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <button
        onClick={handleAddMeasurement}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-4"
      >
        Add Measurement
      </button>

      {/* Seznam */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : measurements.length === 0 ? (
        <p className="text-center text-gray-400">No body measurements yet.</p>
      ) : (
        <ul className="space-y-2">
          {measurements.map((m) => (
            <li
              key={m.id}
              className="flex justify-between items-center px-3 py-2 border rounded hover:bg-gray-50"
            >
              <span>
                {new Date(m.measured_at).toLocaleDateString()} – Chest: {m.chest} cm, Waist: {m.waist} cm, Hips: {m.hips} cm
              </span>
              <button
                onClick={() => handleDeleteMeasurement(m.id)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
