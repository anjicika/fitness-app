import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import UserStatsCards from './UserStatsCards';

const Dashboard = () => {
  const styles = {
    page: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      color: '#2c3e50',
      marginBottom: '0.25rem',
      background: 'linear-gradient(135deg, #3498db, #2c3e50)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '1.1rem',
    },
    timeRangeSelector: {
      display: 'flex',
      gap: '0.5rem',
      background: '#f8f9fa',
      padding: '0.5rem',
      borderRadius: '12px',
    },
    timeRangeBtn: {
      padding: '0.5rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      background: 'transparent',
      color: '#6c757d',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    timeRangeBtnActive: {
      background: '#3498db',
      color: 'white',
      boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
    },
    section: {
      marginBottom: '3rem',
    },
    sectionHeader: {
      fontSize: '1.75rem',
      color: '#2c3e50',
      fontWeight: 700,
      marginBottom: '1.5rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid #f0f2f5',
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem',
    },
    chartCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f0f2f5',
    },
    activitiesCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f0f2f5',
      display: 'flex',
      flexDirection: 'column',
    },
    chartHeader: {
      marginBottom: '1.5rem',
    },
    chartTitle: {
      fontSize: '1.25rem',
      color: '#2c3e50',
      fontWeight: 700,
      marginBottom: '0.25rem',
    },
    chartSubtitle: {
      color: '#7f8c8d',
      fontSize: '0.9rem',
    },
    chartContainer: {
      height: '300px',
    },
    customTooltip: {
      background: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    tooltipLabel: {
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
    },
    tooltipValue: {
      fontSize: '0.9rem',
      margin: '0.25rem 0',
    },
    activitiesList: {
      flex: 1,
      marginBottom: '1.5rem',
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      borderBottom: '1px solid #f0f2f5',
      transition: 'all 0.3s ease',
    },
    activityIcon: {
      fontSize: '1.5rem',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f7ff',
      borderRadius: '10px',
    },
    activityDetails: {
      flex: 1,
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    activityName: {
      fontSize: '1rem',
      color: '#2c3e50',
      margin: 0,
      fontWeight: 600,
    },
    activityDate: {
      fontSize: '0.85rem',
      color: '#7f8c8d',
    },
    activityInfo: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    activityInfoItem: {
      fontSize: '0.85rem',
      color: '#6c757d',
      padding: '0.25rem 0.75rem',
      background: '#f8f9fa',
      borderRadius: '15px',
    },
    activityCalories: {
      color: '#e74c3c',
      fontWeight: 600,
      background: '#ffeaea',
    },
    viewAllBtn: {
      alignSelf: 'flex-start',
      background: 'transparent',
      border: 'none',
      color: '#3498db',
      fontWeight: 600,
      cursor: 'pointer',
      padding: '0.5rem 0',
      transition: 'all 0.3s ease',
    },
    goalsSection: {
      marginTop: '3rem',
    },
    goalsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    goalCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f0f2f5',
    },
    goalHeader: {
      display: 'flex',
      justifycontent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    goalTitle: {
      fontSize: '1.1rem',
      color: '#2c3e50',
      margin: 0,
      fontWeight: 600,
    },
    goalProgress: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#3498db',
    },
    goalProgressBar: {
      height: '10px',
      background: '#f0f2f5',
      borderRadius: '5px',
      overflow: 'hidden',
      marginBottom: '0.75rem',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #3498db, #2ecc71)',
      borderRadius: '5px',
      transition: 'width 1s ease-in-out',
    },
    goalHint: {
      color: '#7f8c8d',
      fontSize: '0.9rem',
      margin: 0,
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '1rem',
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '3px solid #f0f0f0',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

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
        <div style={styles.customTooltip}>
          <p style={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{...styles.tooltipValue, color: entry.color}}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TimeRangeSelector = () => (
    <div style={styles.timeRangeSelector}>
      {['week', 'month', 'year'].map((range) => (
        <button
          key={range}
          style={{
            ...styles.timeRangeBtn,
            ...(timeRange === range ? styles.timeRangeBtnActive : {}),
            ':hover': {
              background: timeRange === range ? '#3498db' : '#e9ecef',
              color: timeRange === range ? 'white' : '#495057',
            },
          }}
          onClick={() => setTimeRange(range)}
        >
          {range === 'week' ? 'Teden' : range === 'month' ? 'Mesec' : 'Leto'}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Nalaganje podatkov...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Nadzorna plošča</h1>
          <p style={styles.subtitle}>Pregled vašega napredka in aktivnosti</p>
        </div>
        <TimeRangeSelector />
      </div>

      {/* Statistika */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Pregled</h2>
        <UserStatsCards stats={stats} loading={loading} />
      </div>

      {/* Grafi */}
      <div style={styles.chartsGrid}>
        {/* Aktivnost po tednih */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Aktivnost po tednih</h3>
            <span style={styles.chartSubtitle}>Število vadb in skupni čas</span>
          </div>
          <div style={styles.chartContainer}>
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
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Kalorije po dnevih</h3>
            <span style={styles.chartSubtitle}>Porabljene kalorije v zadnjih 7 dneh</span>
          </div>
          <div style={styles.chartContainer}>
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
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Tipi vadb</h3>
            <span style={styles.chartSubtitle}>Razporeditev vadb po kategorijah</span>
          </div>
          <div style={styles.chartContainer}>
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
        <div style={styles.activitiesCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Zadnje aktivnosti</h3>
            <span style={styles.chartSubtitle}>Vaše nedavne vadbe</span>
          </div>
          <div style={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} style={styles.activityItem}>
                <div style={styles.activityIcon}>
                  {activity.type === 'Tek' && '🏃'}
                  {activity.type === 'Vadba z utežmi' && '🏋️'}
                  {activity.type === 'Joga' && '🧘'}
                  {activity.type === 'Kolesarjenje' && '🚴'}
                </div>
                <div style={styles.activityDetails}>
                  <div style={styles.activityHeader}>
                    <h4 style={styles.activityName}>{activity.type}</h4>
                    <span style={styles.activityDate}>{activity.date}</span>
                  </div>
                  <div style={styles.activityInfo}>
                    <span style={styles.activityInfoItem}>{activity.duration}</span>
                    {activity.distance && (
                      <span style={styles.activityInfoItem}>{activity.distance}</span>
                    )}
                    {activity.muscle && (
                      <span style={styles.activityInfoItem}>{activity.muscle}</span>
                    )}
                    <span style={{...styles.activityInfoItem, ...styles.activityCalories}}>
                      {activity.calories} kcal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button style={styles.viewAllBtn}>
            Ogled vseh aktivnosti →
          </button>
        </div>
      </div>

      {/* Cilji in dosežki */}
      <div style={styles.goalsSection}>
        <h2 style={styles.sectionHeader}>Cilji za ta mesec</h2>
        <div style={styles.goalsGrid}>
          <div style={styles.goalCard}>
            <div style={styles.goalHeader}>
              <h4 style={styles.goalTitle}>Število vadb</h4>
              <span style={styles.goalProgress}>8/12</span>
            </div>
            <div style={styles.goalProgressBar}>
              <div style={{...styles.progressFill, width: '67%'}}></div>
            </div>
            <p style={styles.goalHint}>2 vadbi do konca tedna</p>
          </div>
          
          <div style={styles.goalCard}>
            <div style={styles.goalHeader}>
              <h4 style={styles.goalTitle}>Porabljene kalorije</h4>
              <span style={styles.goalProgress}>3.2k/5k</span>
            </div>
            <div style={styles.goalProgressBar}>
              <div style={{...styles.progressFill, width: '64%'}}></div>
            </div>
            <p style={styles.goalHint}>1,800 kcal do cilja</p>
          </div>
          
          <div style={styles.goalCard}>
            <div style={styles.goalHeader}>
              <h4 style={styles.goalTitle}>Vadbeni niz</h4>
              <span style={styles.goalProgress}>5/7 dni</span>
            </div>
            <div style={styles.goalProgressBar}>
              <div style={{...styles.progressFill, width: '71%'}}></div>
            </div>
            <p style={styles.goalHint}>2 dni do tedenskega niza</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;