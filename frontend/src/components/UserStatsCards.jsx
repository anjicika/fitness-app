import React from 'react';

const UserStatsCards = ({ stats, loading }) => {
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #f0f2f5',
      ':hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
      },
    },
    statIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.8rem',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
    },
    statContent: {
      flex: 1,
    },
    statValue: {
      fontSize: '2.2rem',
      fontWeight: 800,
      marginBottom: '0.25rem',
      lineHeight: 1,
    },
    statTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '0.5rem',
    },
    statDescription: {
      fontSize: '0.85rem',
      color: '#7f8c8d',
      lineHeight: 1.4,
    },
    statTrend: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f0f2f5',
      fontSize: '0.85rem',
    },
    trendUp: {
      color: '#27ae60',
      fontWeight: 600,
    },
    trendPeriod: {
      color: '#95a5a6',
    },
    skeleton: {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
      borderRadius: '4px',
    },
    loadingCard: {
      minHeight: '150px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
  };

  const statCards = [
    {
      id: 'workouts',
      title: 'Število vadb',
      value: stats?.totalWorkouts || 0,
      icon: '🏋️',
      color: '#3498db',
      description: 'Skupno število opravljenih vadb'
    },
    {
      id: 'calories',
      title: 'Porabljene kalorije',
      value: `${stats?.caloriesBurned || 0}`,
      icon: '🔥',
      color: '#e74c3c',
      description: 'Kalorije porabljene v zadnjih 30 dneh'
    },
    {
      id: 'streak',
      title: 'Trenutni niz',
      value: `${stats?.currentStreak || 0} dni`,
      icon: '⚡',
      color: '#f39c12',
      description: 'Zaporedni dnevi z aktivnostjo'
    },
    {
      id: 'duration',
      title: 'Skupni čas',
      value: `${stats?.totalDuration || 0}h`,
      icon: '⏱️',
      color: '#2ecc71',
      description: 'Skupni čas vadbe'
    }
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} style={{...styles.statCard, ...styles.loadingCard}}>
            <div style={{...styles.statIcon, ...styles.skeleton}}></div>
            <div style={styles.statContent}>
              <div style={{...styles.statValue, ...styles.skeleton, width: '80px', height: '2.2rem', marginBottom: '0.5rem'}}></div>
              <div style={{...styles.statTitle, ...styles.skeleton, width: '120px', height: '1rem', marginBottom: '0.5rem'}}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {statCards.map((stat) => (
        <div 
          key={stat.id} 
          style={{
            ...styles.statCard,
            '--card-color': stat.color,
            '::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: `var(--card-color, ${stat.color})`,
            },
          }}
        >
          <div style={{
            ...styles.statIcon,
            backgroundColor: `${stat.color}20`,
            ':hover': {
              transform: 'scale(1.1)',
            },
          }}>
            <span style={{ color: stat.color }}>{stat.icon}</span>
          </div>
          <div style={styles.statContent}>
            <div style={{...styles.statValue, color: stat.color}}>
              {stat.value}
            </div>
            <div style={styles.statTitle}>{stat.title}</div>
            <div style={styles.statDescription}>{stat.description}</div>
          </div>
          <div style={styles.statTrend}>
            <span style={styles.trendUp}>↑ 12%</span>
            <span style={styles.trendPeriod}> od prejšnjega meseca</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStatsCards;