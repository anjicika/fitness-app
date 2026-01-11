import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      } else {
        // Mock data for development
        setBookings([
          {
            id: 1,
            coach: { id: 1, name: 'John Smith', specialty: 'Strength Training' },
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            status: 'confirmed',
            price: 80,
            notes: 'Focus on upper body strength',
          },
          {
            id: 2,
            coach: { id: 2, name: 'Sarah Johnson', specialty: 'Yoga & Flexibility' },
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            status: 'completed',
            price: 65,
            notes: 'Beginner yoga session',
          },
          {
            id: 3,
            coach: { id: 3, name: 'Mike Wilson', specialty: 'CrossFit' },
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            status: 'pending',
            price: 75,
            notes: 'CrossFit fundamentals',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      // Mock data for development
      setBookings([
        {
          id: 1,
          coach: { id: 1, name: 'John Smith', specialty: 'Strength Training' },
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          status: 'confirmed',
          price: 80,
          notes: 'Focus on upper body strength',
        },
        {
          id: 2,
          coach: { id: 2, name: 'Sarah Johnson', specialty: 'Yoga & Flexibility' },
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          status: 'completed',
          price: 65,
          notes: 'Beginner yoga session',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setBookings(bookings.filter((b) => b.id !== selectedBooking.id));
        setShowCancelModal(false);
        setSelectedBooking(null);
        alert('Booking cancelled successfully');
      } else {
        alert('Failed to cancel booking: ' + result.message);
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(booking.startTime) > new Date();
    if (filter === 'past') return new Date(booking.startTime) <= new Date();
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'upcoming', 'past', 'confirmed', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
          <button
            onClick={() => (window.location.hash = '/coaches')}
            className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            Find a Coach
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isUpcoming = new Date(booking.startTime) > new Date();
            const canCancel =
              isUpcoming && (booking.status === 'confirmed' || booking.status === 'pending');

            return (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {booking.Coach?.name || 'Unknown Coach'}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-1">
                          {booking.Coach?.specialty || 'Unknown Specialty'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.startTime.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {booking.startTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -
                              {booking.endTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>€{booking.price}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {canCancel && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel
                      </button>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        onClick={() => alert('Review feature coming soon!')}
                        className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                      >
                        Leave Review
                      </button>
                    )}

                    {booking.status === 'pending' && (
                      <button
                        onClick={() => alert('Payment feature coming soon!')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Cancel Booking</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to cancel your session with {selectedBooking.coach.name}?
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">Booking Details:</p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.startTime.toLocaleDateString()} at{' '}
                  {selectedBooking.startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.coach.name} - {selectedBooking.coach.specialty}
                </p>
              </div>

              <p className="text-sm text-red-600">
                Note: Cancellation policy may apply. Please check with the coach for refund
                information.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelBooking}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
              >
                Yes, Cancel Booking
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
