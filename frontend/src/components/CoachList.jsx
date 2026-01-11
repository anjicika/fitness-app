import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { Search, Filter, Star, MapPin, DollarSign, Clock } from 'lucide-react';

export default function CoachList({ onSelectCoach }) {
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    priceRange: '',
    rating: '',
    availability: '',
  });

  const filterCoaches = useCallback(() => {
    let filtered = coaches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (coach) =>
          coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coach.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coach.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty filter
    if (filters.specialty) {
      filtered = filtered.filter((coach) =>
        coach.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((coach) => coach.hourlyRate >= min && coach.hourlyRate <= max);
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter((coach) => coach.rating >= parseFloat(filters.rating));
    }

    setFilteredCoaches(filtered);
  }, [coaches, searchTerm, filters]);

  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    filterCoaches();
  }, [filterCoaches]);

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/coaches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setCoaches(result.data);
      }
    } catch {
      // console.error('Failed to fetch coaches:', err);
      // Mock data for development
      setCoaches([
        {
          id: 1,
          name: 'John Smith',
          specialty: 'Strength Training',
          rating: 4.8,
          hourlyRate: 80,
          location: 'Ljubljana',
          bio: 'Certified strength coach with 10+ years experience',
          availability: ['morning', 'afternoon', 'evening'],
          image: null,
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          specialty: 'Yoga & Flexibility',
          rating: 4.9,
          hourlyRate: 65,
          location: 'Maribor',
          bio: 'Yoga instructor specializing in flexibility and mindfulness',
          availability: ['morning', 'evening'],
          image: null,
        },
        {
          id: 3,
          name: 'Mike Wilson',
          specialty: 'CrossFit',
          rating: 4.7,
          hourlyRate: 75,
          location: 'Celje',
          bio: 'CrossFit Level 2 trainer with competitive background',
          availability: ['afternoon', 'evening'],
          image: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    'Strength Training',
    'Yoga',
    'CrossFit',
    'Cardio',
    'Nutrition',
    'Rehabilitation',
  ];
  const priceRanges = ['0-50', '50-75', '75-100', '100+'];

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search coaches by name, specialty, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filters.specialty}
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          <select
            value={filters.priceRange}
            onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Prices</option>
            {priceRanges.map((range) => (
              <option key={range} value={range}>
                €{range}/hour
              </option>
            ))}
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ specialty: '', priceRange: '', rating: '', availability: '' });
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading coaches...</p>
        </div>
      )}

      {/* Coach List */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              {/* Coach Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {coach.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                    <p className="text-sm text-gray-600">{coach.specialty}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{coach.rating}</span>
                <span className="text-sm text-gray-500">(24 reviews)</span>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{coach.bio}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{coach.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>€{coach.hourlyRate}/hour</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {(() => {
                      const avail = coach.availability;
                      if (Array.isArray(avail)) return avail.join(', ');
                      if (typeof avail === 'string') {
                        try {
                          const parsed = JSON.parse(avail);
                          return Array.isArray(parsed) ? parsed.join(', ') : avail;
                        } catch {
                          return avail.replace(/[[\]"]/g, '');
                        }
                      }
                      return 'Not specified';
                    })()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCoach(coach)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                View Availability
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredCoaches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No coaches found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ specialty: '', priceRange: '', rating: '', availability: '' });
            }}
            className="mt-4 text-blue-500 hover:text-blue-600"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
