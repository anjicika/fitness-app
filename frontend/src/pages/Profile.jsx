import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhotoUpload from './PhotoUpload';
import ProfileEditForm from './ProfileEditForm';
import UserStatsCards from './UserStatsCards';

const Profile = () => {
  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem',
    },
    header: {
      marginBottom: '2.5rem',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      color: '#2c3e50',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #3498db, #2c3e50)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '1.1rem',
    },
    saveMessage: {
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginBottom: '2rem',
      textAlign: 'center',
      fontWeight: 600,
      animation: 'slideDown 0.3s ease',
    },
    successMessage: {
      backgroundColor: '#d5edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '2.5rem',
    },
    sidebar: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      height: 'fit-content',
      position: 'sticky',
      top: '2rem',
    },
    avatarSection: {
      textAlign: 'center',
      marginBottom: '2.5rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid #f0f2f5',
    },
    infoSummary: {
      textAlign: 'center',
    },
    userName: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#2c3e50',
      marginBottom: '0.5rem',
    },
    userEmail: {
      color: '#7f8c8d',
      fontSize: '0.95rem',
      marginBottom: '1rem',
    },
    userLocation: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      color: '#3498db',
      fontSize: '0.9rem',
      marginBottom: '1.5rem',
    },
    userBio: {
      background: '#f8f9fa',
      padding: '1rem',
      borderRadius: '8px',
      borderLeft: '3px solid #3498db',
    },
    statsSection: {
      marginTop: '2rem',
    },
    statsTitle: {
      fontSize: '1.25rem',
      color: '#2c3e50',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    main: {
      background: 'white',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    actionsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #f0f2f5',
    },
    sectionTitle: {
      fontSize: '1.75rem',
      color: '#2c3e50',
      fontWeight: 700,
    },
    editBtn: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
      },
    },
    editModeIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#f39c12',
      fontWeight: 600,
      background: '#fef9e7',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      border: '1px solid #f8c471',
    },
    indicatorDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#f39c12',
      borderRadius: '50%',
      animation: 'pulse 2s infinite',
    },
    infoDetails: {
      paddingTop: '1rem',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
      marginBottom: '3rem',
    },
    infoItem: {
      background: '#f8f9fa',
      padding: '1.25rem',
      borderRadius: '8px',
      borderLeft: '3px solid #3498db',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    infoLabel: {
      display: 'block',
      fontSize: '0.85rem',
      color: '#7f8c8d',
      fontWeight: 600,
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    infoText: {
      color: '#2c3e50',
      fontSize: '1.1rem',
      fontWeight: 500,
      margin: 0,
    },
    bioText: {
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
    },
    accountSettings: {
      marginTop: '2.5rem',
      paddingTop: '2rem',
      borderTop: '1px solid #f0f2f5',
    },
    settingsTitle: {
      fontSize: '1.25rem',
      color: '#2c3e50',
      marginBottom: '1.5rem',
    },
    settingsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    settingsItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'white',
      border: '1px solid #e9ecef',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      color: '#495057',
      fontWeight: 500,
      textAlign: 'left',
      width: '100%',
      ':hover': {
        background: '#f8f9fa',
        borderColor: '#3498db',
        transform: 'translateX(5px)',
      },
    },
    settingsIcon: {
      fontSize: '1.2rem',
      width: '24px',
      textAlign: 'center',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    },
    profileSkeleton: {
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    avatarSkeleton: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      margin: '0 auto 2rem',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
    },
    infoSkeleton: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center',
    },
  };

  const [user, setUser] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    dateOfBirth: '',
    profilePicture: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Napaka pri nalaganju profila:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Napaka pri nalaganju statistike:', error);
    }
  };

  const handlePhotoUpload = (imageUrl) => {
    setUser({ ...user, profilePicture: imageUrl });
    showMessage('Slika uspešno naložena!');
  };

  const handleSaveProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setIsEditing(false);
      showMessage('Profil uspešno posodobljen!');
    } catch (error) {
      console.error('Napaka pri shranjevanju profila:', error);
      showMessage('Napaka pri shranjevanju profila', 'error');
    }
  };

  const showMessage = (message, type = 'success') => {
    setSaveMessage({ text: message, type });
    setTimeout(() => {
      setSaveMessage('');
    }, 3000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.profileSkeleton}>
          <div style={styles.avatarSkeleton}></div>
          <div style={styles.infoSkeleton}>
            <div style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              borderRadius: '4px',
              width: '60%',
              height: '2rem'
            }}></div>
            <div style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              borderRadius: '4px',
              width: '40%',
              height: '1.5rem'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Moj profil</h1>
        <p style={styles.subtitle}>Upravljajte z vašimi osebnimi podatki in nastavitvami</p>
      </div>

      {saveMessage && (
        <div style={{
          ...styles.saveMessage,
          ...(saveMessage.type === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {saveMessage.text}
        </div>
      )}

      <div style={styles.content}>
        {/* Levi stolpec */}
        <div style={styles.sidebar}>
          <div style={styles.avatarSection}>
            <div style={{ marginBottom: '1.5rem' }}>
              <PhotoUpload 
                onUploadSuccess={handlePhotoUpload}
                currentImage={user.profilePicture}
              />
            </div>
            
            {!isEditing && (
              <div style={styles.infoSummary}>
                <h2 style={styles.userName}>{user.name}</h2>
                <p style={styles.userEmail}>{user.email}</p>
                {user.location && (
                  <p style={styles.userLocation}>
                    <span style={{ marginRight: '0.5rem' }}>📍</span> {user.location}
                  </p>
                )}
                {user.bio && (
                  <div style={styles.userBio}>
                    <p>{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistika */}
          <div style={styles.statsSection}>
            <h3 style={styles.statsTitle}>Moja statistika</h3>
            <UserStatsCards stats={stats} loading={!stats} />
          </div>
        </div>

        {/* Desni stolpec */}
        <div style={styles.main}>
          <div style={styles.actionsHeader}>
            <h2 style={styles.sectionTitle}>Osebni podatki</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                style={styles.editBtn}
              >
                <span style={{ marginRight: '0.5rem' }}>✏️</span>
                Uredi profil
              </button>
            ) : (
              <div style={styles.editModeIndicator}>
                <span style={styles.indicatorDot}></span>
                Način urejanja
              </div>
            )}
          </div>

          {isEditing ? (
            <ProfileEditForm 
              user={user}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div style={styles.infoDetails}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Polno ime</label>
                  <p style={styles.infoText}>{user.name}</p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>E-pošta</label>
                  <p style={styles.infoText}>{user.email}</p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Telefon</label>
                  <p style={styles.infoText}>{user.phone || 'Ni podatka'}</p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Datum rojstva</label>
                  <p style={styles.infoText}>
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('sl-SI') : 'Ni podatka'}
                  </p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Lokacija</label>
                  <p style={styles.infoText}>{user.location || 'Ni podatka'}</p>
                </div>
                <div style={{...styles.infoItem, ...styles.fullWidth}}>
                  <label style={styles.infoLabel}>O meni</label>
                  <p style={{...styles.infoText, ...styles.bioText}}>
                    {user.bio || 'Ni podatka'}
                  </p>
                </div>
              </div>
              
              <div style={styles.accountSettings}>
                <h3 style={styles.settingsTitle}>Nastavitve računa</h3>
                <div style={styles.settingsList}>
                  <button style={styles.settingsItem}>
                    <span style={styles.settingsIcon}>🔒</span>
                    Spremeni geslo
                  </button>
                  <button style={styles.settingsItem}>
                    <span style={styles.settingsIcon}>🔔</span>
                    Obvestila
                  </button>
                  <button style={styles.settingsItem}>
                    <span style={styles.settingsIcon}>👥</span>
                    Zasebnost
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;