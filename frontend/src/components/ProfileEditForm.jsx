import React, { useState } from 'react';

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const styles = {
    form: {
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
    },
    section: {
      marginBottom: '2.5rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      color: '#2c3e50',
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #f0f2f5',
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 600,
      color: '#34495e',
      fontSize: '0.9rem',
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8f9fa',
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8f9fa',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit',
    },
    errorInput: {
      borderColor: '#e74c3c',
      backgroundColor: '#fff5f5',
    },
    errorMessage: {
      display: 'block',
      color: '#e74c3c',
      fontSize: '0.85rem',
      marginTop: '0.25rem',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #f0f2f5',
    },
    btn: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '120px',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      color: 'white',
    },
    btnSecondary: {
      background: '#95a5a6',
      color: 'white',
    },
    btnHover: {
      transform: 'translateY(-2px)',
    },
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    dateOfBirth: user?.dateOfBirth || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ime je obvezno';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-pošta je obvezna';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neveljaven format e-pošte';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSave(formData);
  };

  const inputStyle = (fieldName) => ({
    ...styles.formInput,
    ...(errors[fieldName] ? styles.errorInput : {}),
    ':focus': {
      outline: 'none',
      borderColor: '#3498db',
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)',
    },
  });

  const buttonHover = {
    ':hover': {
      ...styles.btnHover,
      boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Osnovni podatki</h3>
        
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.formLabel}>
            Ime in priimek *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={inputStyle('name')}
            placeholder="Vnesite vaše ime"
          />
          {errors.name && <span style={styles.errorMessage}>{errors.name}</span>}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.formLabel}>
            E-pošta *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle('email')}
            placeholder="vasa.email@primer.com"
          />
          {errors.email && <span style={styles.errorMessage}>{errors.email}</span>}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.formLabel}>
            Telefonska številka
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={styles.formInput}
            placeholder="+386 40 123 456"
          />
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Osebni podatki</h3>
        
        <div style={styles.formGroup}>
          <label htmlFor="dateOfBirth" style={styles.formLabel}>
            Datum rojstva
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            style={styles.formInput}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="location" style={styles.formLabel}>
            Lokacija
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={styles.formInput}
            placeholder="Mesto, država"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="bio" style={styles.formLabel}>
            Biografija
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            style={styles.formTextarea}
            rows="4"
            placeholder="Napišite nekaj o sebi..."
          />
        </div>
      </div>

      <div style={styles.formActions}>
        <button 
          type="button" 
          style={{...styles.btn, ...styles.btnSecondary}} 
          onClick={onCancel}
        >
          Prekliči
        </button>
        <button 
          type="submit" 
          style={{...styles.btn, ...styles.btnPrimary}}
        >
          Shrani spremembe
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;