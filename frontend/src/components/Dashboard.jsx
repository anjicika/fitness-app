import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WeightTracker from './WeightTracker';
import WeightStatistics from './WeightStatistics';
import BodyMeasurementTracker from './BodyMeasurementsTracker';
import BodyMeasurementsStatistics from './BodyMeasurementsStatistics';
import Navbar from './Navbar';

export default function Dashboard() {
  // Dodana stanja za AI parametre
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');

  const handleUpdateBio = async () => {
    try {
      const token = localStorage.getItem('token');
      // Pokliče backend za posodobitev profilnih podatkov
      await fetch('http://localhost:3000/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ age, height })
      });
      alert('Profile updated! AI Nutrition feature is now active.');
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
        <p className="text-center text-gray-600 mb-6">
          Stay on top of your fitness journey by logging your stats and watching your progress grow.
        </p>

        {/* NOVA SEKCIJA: Samo za vnos starosti in višine, ki jo potrebuje AI */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow border-l-4 border-blue-500 max-w-4xl mx-auto">
          <h2 className="text-lg font-bold mb-4">Personal Details for AI Coach</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">Age</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="p-2 border rounded mt-1 w-24 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="25"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">Height (cm)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                className="p-2 border rounded mt-1 w-24 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="180"
              />
            </div>
            <button 
              onClick={handleUpdateBio}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Update AI Profile
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">*Nutrition AI needs these to calculate your daily calories correctly.</p>
        </section>

        {/* Weight Tracking + Statistics (Ostalo nespremenjeno) */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="basis-1/3">
              <WeightTracker />
            </div>
            <div className="basis-2/3">
              <WeightStatistics />
            </div>
          </div>
        </section>

        {/* Body Measurements Tracking + Statistics (Ostalo nespremenjeno) */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="basis-1/3">
              <BodyMeasurementTracker />
            </div>

            <div className="basis-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {['waist', 'chest', 'hips'].map((type) => (
                <BodyMeasurementsStatistics key={type} type={type} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}