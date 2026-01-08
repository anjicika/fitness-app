import React, { useEffect, useState } from 'react';
import { getWeightStatistics } from '../api/statistics'; // ista funkcija, samo dodamo type
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function BodyMeasurementsStatistics({ type = 'waist' }) {
  const [stats, setStats] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(30);

  const fetchStats = async (p) => {
    try {
      setLoading(true);
      setError('');

      // type je obvezen za measurements
      const res = await getWeightStatistics(p, type, 'measurement');

      if (res.success && res.data) {
        setStats(res.data);
        setRawData(res.data.dataPointsArray || []);
      } else {
        setError(res.error || 'Unexpected API response');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period, type]);

  const handlePeriodChange = (days) => setPeriod(days);

  if (loading) return <p className="text-center text-gray-500">Loading statistics...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!stats) return null;

  return (
    <div className="max-w-md mx-auto md:max-w-full p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{type.charAt(0).toUpperCase() + type.slice(1)} Statistics</h2>
        <div className="flex flex-wrap justify-end gap-2">
            {[7, 30, 90].map((d) => (
                <button
                key={d}
                onClick={() => handlePeriodChange(d)}
                className={`px-2 py-1 rounded ${
                    period === d ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                >
                Last {d} days
                </button>
            ))}
            </div>
      </div>

      {stats.trend === 'no-data' ? (
        <p className="text-center text-gray-400">No data available.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div><strong>Start:</strong> {stats.startValue} cm</div>
            <div><strong>End:</strong> {stats.endValue} cm</div>
            <div><strong>Change:</strong> {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} cm</div>
            <div><strong>Average:</strong> {stats.average.toFixed(1)} cm</div>
            <div><strong>Trend:</strong> {stats.trend}</div>
            <div><strong>Data Points:</strong> {stats.dataPoints}</div>
            {stats.percentChange !== undefined && (
              <div><strong>% Change:</strong> {stats.percentChange}%</div>
            )}
          </div>

          {rawData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rawData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
