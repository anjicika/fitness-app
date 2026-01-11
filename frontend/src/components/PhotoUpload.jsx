import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const PhotoUpload = ({ onUploadSuccess, currentImage }) => {
  const styles = {
    container: {
      width: '100%',
      maxWidth: '300px',
      margin: '0 auto',
    },
    dropzone: {
      border: '2px dashed #ced4da',
      borderRadius: '50%',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8f9fa',
      width: '200px',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    },
    dropzoneActive: {
      borderColor: '#007bff',
      backgroundColor: '#e7f3ff',
    },
    dropzoneHover: {
      borderColor: '#007bff',
      backgroundColor: '#e7f3ff',
    },
    imagePreview: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
    },
    overlayText: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      borderRadius: '50%',
      padding: '20px',
      textAlign: 'center',
    },
    uploadPlaceholder: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px',
    },
    uploadIcon: {
      color: '#6c757d',
      marginBottom: '10px',
    },
    uploadText: {
      color: '#495057',
      fontWeight: 500,
      marginBottom: '5px',
    },
    uploadHint: {
      color: '#6c757d',
      fontSize: '0.85rem',
    },
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/user/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.imageUrl);
      }
    } catch (error) {
      console.error('Napaka pri nalaganju slike:', error);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const dropzoneStyle = {
    ...styles.dropzone,
    ...(isDragActive ? styles.dropzoneActive : {}),
  };

  return (
    <div style={styles.container}>
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        
        {currentImage ? (
          <div style={styles.imagePreview}>
            <img src={currentImage} alt="Profilna slika" style={styles.previewImage} />
            <div style={styles.overlayText}>
              <p>Kliknite ali povlecite za zamenjavo slike</p>
            </div>
          </div>
        ) : (
          <div style={styles.uploadPlaceholder}>
            <div style={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p style={styles.uploadText}>
              {isDragActive ? 'Spustite sliko tukaj...' : 'Povlecite sliko ali kliknite za izbiro'}
            </p>
            <p style={styles.uploadHint}>Podprti formati: JPG, PNG, GIF (max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;