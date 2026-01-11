import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, User, DollarSign, X } from 'lucide-react';

export default function BookingCalendar({ selectedCoach, onCoachChange }) {
  const [coaches, setCoaches] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('timeGridWeek');

  useEffect(() => {
    fetchCoaches();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedCoach) {
      fetchAvailableSlots(selectedCoach.id);
    }
  }, [selectedCoach]);

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/coaches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setCoaches(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
    }
  };

  const fetchAvailableSlots = async (coachId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/coaches/${coachId}/availability`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        // Transform API slots to FullCalendar format
        const formattedSlots = result.data.map(slot => ({
          id: slot.id,
          title: 'Available',
          start: slot.start,
          end: slot.end,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          extendedProps: {
            type: 'available',
            coachId: coachId
          }
        }));
        setAvailableSlots(formattedSlots);
      } else {
        // Mock available slots for development
        const mockSlots = generateMockSlots();
        setAvailableSlots(mockSlots);
      }
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
      // Mock available slots for development
      const mockSlots = generateMockSlots();
      setAvailableSlots(mockSlots);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate 3-4 slots per day
      const slotCount = Math.floor(Math.random() * 2) + 3;
      for (let j = 0; j < slotCount; j++) {
        const hour = 9 + j * 2; // 9 AM, 11 AM, 1 PM, 3 PM
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          id: `slot-${i}-${j}`,
          title: 'Available',
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          extendedProps: {
            type: 'available',
            coachId: selectedCoach?.id
          }
        });
      }
    }
    
    return slots;
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/bookings/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        // Transform bookings to FullCalendar format
        const formattedBookings = result.data.map(booking => ({
          id: booking.id,
          title: `Session with ${booking.coach?.name || 'Coach'}`,
          start: booking.startTime,
          end: booking.endTime,
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          extendedProps: {
            type: 'booking',
            coach: booking.coach
          }
        }));
        setBookings(formattedBookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleSlotClick = (info) => {
    const event = info.event;
    if (event.extendedProps.type === 'available') {
      setSelectedSlot({
        id: event.id,
        start: event.start,
        end: event.end,
        coachId: event.extendedProps.coachId
      });
      setShowBookingModal(true);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedCoach) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coachId: selectedCoach.id,
          startTime: selectedSlot.start.toISOString(),
          endTime: selectedSlot.end.toISOString()
        })
      });

      const result = await response.json();
      if (result.success) {
        // Remove the booked slot from available slots
        setAvailableSlots(slots => slots.filter(slot => slot.id !== selectedSlot.id));
        
        // Add to bookings
        const newBooking = {
          id: result.data.id,
          title: `Session with ${selectedCoach.name}`,
          start: selectedSlot.start,
          end: selectedSlot.end,
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          extendedProps: {
            type: 'booking',
            coach: selectedCoach
          }
        };
        setBookings([...bookings, newBooking]);
        
        setShowBookingModal(false);
        setSelectedSlot(null);
        
        alert('Booking confirmed successfully!');
      } else {
        alert('Booking failed: ' + result.message);
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Booking failed. Please try again.');
    }
  };

  const calendarEvents = [...availableSlots, ...bookings];

  return (
    <div>
      {/* Coach Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Coach
        </label>
        <select
          value={selectedCoach?.id || ''}
          onChange={(e) => {
            const coach = coaches.find(c => c.id === parseInt(e.target.value));
            onCoachChange(coach);
          }}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a coach...</option>
          {coaches.map(coach => (
            <option key={coach.id} value={coach.id}>
              {coach.name} - {coach.specialty} (€{coach.hourlyRate}/hr)
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Info */}
      {selectedCoach && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">{selectedCoach.name}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <DollarSign className="w-4 h-4" />
              <span>€{selectedCoach.hourlyRate}/hour</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-4 h-4" />
              <span>{selectedCoach.specialty}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span>Click green slots to book</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleSlotClick}
            selectable={false}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            nowIndicator={true}
          />
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Confirm Booking</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Coach</p>
                <p className="font-medium">{selectedCoach.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {selectedSlot.start.toLocaleDateString()} at {selectedSlot.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">1 hour</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium text-lg">€{selectedCoach.hourlyRate}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBooking}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
