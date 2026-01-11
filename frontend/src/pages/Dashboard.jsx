import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import UserStatsCards from '../components/UserStatsCards';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({
    weeklyActivity: [],
    dailyCalories: [],
    workoutTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsResponse, chartsResponse] = await Promise.all([
        axios.get('/api/user/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/user/dashboard/charts?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(statsResponse.data);
      setChartData(chartsResponse.data);
    } catch (error) {
      console.error('Napaka pri nalaganju podatkov:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    { id: 1, type: 'Tek', duration: '45 min', distance: '5 km', calories: 420, date: 'Danes' },
    { id: 2, type: 'Vadba z utežmi', duration: '60 min', muscle: 'Prsni mišici', calories: 380, date: 'Včeraj' },
    { id: 3, type: 'Joga', duration: '30 min', style: 'Vinyasa', calories: 180, date: 'Pred 2 dnevoma' },
    { id: 4, type: 'Kolesarjenje', duration: '50 min', distance: '15 km', calories: 450, date: 'Pred 3 dnevoma' }
  ];

  const workoutTypesData = [
    { name: 'Kardio', value: 40, color: '#0088FE' },
    { name: 'Moč', value: 30, color: '#00C49F' },
    { name: 'Joga', value: 20, color: '#FFBB28' },
    { name: 'Ostalo', value: 10, color: '#FF8042' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TimeRangeSelector = () => (
    <div className="time-range-selector">
      {['week', 'month', 'year'].map((range) => (
        <button
          key={range}
          className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
          onClick={() => setTimeRange(range)}
        >
          {range === 'week' ? 'Teden' : range === 'month' ? 'Mesec' : 'Leto'}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Nalaganje podatkov...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Nadzorna plošča</h1>
          <p className="dashboard-subtitle">Pregled vašega napredka in aktivnosti</p>
        </div>
        <TimeRangeSelector />
      </div>

      {/* Statistika */}
      <div className="dashboard-section">
        <h2 className="section-header">Pregled</h2>
        <UserStatsCards stats={stats} loading={loading} />
      </div>

      {/* Grafi */}
      <div className="charts-grid">
        {/* Aktivnost po tednih */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Aktivnost po tednih</h3>
            <span className="chart-subtitle">Število vadb in skupni čas</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  stroke="#666"
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#666"
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  stroke="#666"
                  tick={{ fill: '#666' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="workouts"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="duration"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kalorije po dnevih */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Kalorije po dnevih</h3>
            <span className="chart-subtitle">Porabljene kalorije v zadnjih 7 dneh</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.dailyCalories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#666"
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fill: '#666' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="calories" 
                  fill="#0088FE"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tipi vadb */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Tipi vadb</h3>
            <span className="chart-subtitle">Razporeditev vadb po kategorijah</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workoutTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workoutTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zadnje aktivnosti */}
        <div className="activities-card">
          <div className="chart-header">
            <h3>Zadnje aktivnosti</h3>
            <span className="chart-subtitle">Vaše nedavne vadbe</span>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'Tek' && '🏃'}
                  {activity.type === 'Vadba z utežmi' && '🏋️'}
                  {activity.type === 'Joga' && '🧘'}
                  {activity.type === 'Kolesarjenje' && '🚴'}
                </div>
                <div className="activity-details">
                  <div className="activity-header">
                    <h4>{activity.type}</h4>
                    <span className="activity-date">{activity.date}</span>
                  </div>
                  <div className="activity-info">
                    <span className="activity-duration">{activity.duration}</span>
                    {activity.distance && (
                      <span className="activity-distance">{activity.distance}</span>
                    )}
                    {activity.muscle && (
                      <span className="activity-muscle">{activity.muscle}</span>
                    )}
                    <span className="activity-calories">{activity.calories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn">
            Ogled vseh aktivnosti →
          </button>
        </div>
      </div>

      {/* Cilji in dosežki */}
      <div className="goals-section">
        <h2 className="section-header">Cilji za ta mesec</h2>
        <div className="goals-grid">
          <div className="goal-card">
            <div className="goal-header">
              <h4>Število vadb</h4>
              <span className="goal-progress">8/12</span>
            </div>
            <div className="goal-progress-bar">
              <div className="progress-fill" style={{ width: '67%' }}></div>
            </div>
            <p className="goal-hint">2 vadbi do konca tedna</p>
          </div>
          
          <div className="goal-card">
            <div className="goal-header">
              <h4>Porabljene kalorije</h4>
              <span className="goal-progress">3.2k/5k</span>
            </div>
            <div className="goal-progress-bar">
              <div className="progress-fill" style={{ width: '64%' }}></div>
            </div>
            <p className="goal-hint">1,800 kcal do cilja</p>
          </div>
          
          <div className="goal-card">
            <div className="goal-header">
              <h4>Vadbeni niz</h4>
              <span className="goal-progress">5/7 dni</span>
            </div>
            <div className="goal-progress-bar">
              <div className="progress-fill" style={{ width: '71%' }}></div>
            </div>
            <p className="goal-hint">2 dni do tedenskega niza</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;