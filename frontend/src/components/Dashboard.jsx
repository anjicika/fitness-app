// frontend/src/components/Dashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WeightTracker from './WeightTracker';
import WeightStatistics from './WeightStatistics';
import BodyMeasurementTracker from './BodyMeasurementsTracker';
import { logout } from '../api/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // kliče backend, da počisti cookie
      navigate('/login'); // preusmeri uporabnika na login
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-blue-500 text-white px-8 py-4 flex justify-between items-center font-semibold">
        {/* Levi del navigacije */}
        <div className="flex gap-6">
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboards</Link>
          <span>Workouts</span>
          <span>Nutrition</span>
          <span>Forum</span>
        </div>

        {/* Desni del logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </nav>

      {/* GLAVNA VSEBINA */}
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

        {/* Weight Tracking + Statistics */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tracker levo */}
            <div className="flex-1">
              <WeightTracker />
            </div>

            {/* Statistika desno */}
            <div className="flex-1">
              <WeightStatistics />
            </div>
          </div>
        </section>

        {/* Body Measurement Tracking */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <BodyMeasurementTracker />
        </section>

        {/* Tukaj še je statistika */}
      </main>
    </div>
  );
}
