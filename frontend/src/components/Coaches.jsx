import React, { useState } from 'react';
import Navbar from './Navbar';
import CoachList from './CoachList';
import BookingCalendar from './BookingCalendar';
import MyBookings from './MyBookings';

export default function Coaches() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCoach, setSelectedCoach] = useState(null);

  const handleSelectCoach = (coach) => {
    setSelectedCoach(coach);
    setActiveTab('calendar');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Coach Booking</h1>
          <p className="text-gray-600">Find and book sessions with expert fitness coaches</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Find Coaches
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'calendar'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Booking Calendar
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'my-bookings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Bookings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'list' && <CoachList onSelectCoach={handleSelectCoach} />}

          {activeTab === 'calendar' && (
            <BookingCalendar
              selectedCoach={selectedCoach}
              onCoachChange={(coach) => setSelectedCoach(coach)}
            />
          )}

          {activeTab === 'my-bookings' && <MyBookings />}
        </div>
      </main>
    </div>
  );
}
