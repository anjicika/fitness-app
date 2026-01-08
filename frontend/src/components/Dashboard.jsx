import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WeightTracker from './WeightTracker';
import WeightStatistics from './WeightStatistics';
import BodyMeasurementTracker from './BodyMeasurementsTracker';
import BodyMeasurementsStatistics from './BodyMeasurementsStatistics';
import Navbar from './Navbar';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
        <p className="text-center text-gray-600 mb-6">
          Stay on top of your fitness journey by logging your stats and watching your progress grow.
        </p>

        {/* Weight Tracking + Statistics */}
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

        {/* Body Measurements Tracking + Statistics */}
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
