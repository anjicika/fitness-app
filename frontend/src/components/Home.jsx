import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-blue-500 text-white px-8 py-4 flex justify-around font-semibold">
        <Link to="/home">Home</Link>
        <Link to="/dashboard">Dashboards</Link>
        <span>Workouts</span>
        <span>Nutrition</span>
        <span>Forum</span>
      </nav>

      {/* GLAVNA VSEBINA */}
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Fitnesseri!</h1>
        <p className="text-gray-700">
          This is your home page. Use the navigation above to explore different sections.
        </p>

        {/* Placeholder za Dashboard */}
        <section className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <div className="space-y-2">
            <p>Weight Tracking</p>
            <p>Body Measurement Tracking</p>
          </div>
        </section>
      </main>
    </div>
  );
}
