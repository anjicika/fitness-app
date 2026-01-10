// frontend/src/api/metrics.js
const API_URL = 'http://localhost:3000/api/v1/metrics';

function getToken() {
  return localStorage.getItem('token');
}

// ===== WEIGHT ENDPOINTS =====
export async function getWeights() {
  const res = await fetch(`${API_URL}/weights`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function addWeight(weight_kg) {
  try {
    const res = await fetch(`${API_URL}/weights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ weight_kg }),
    });
    
    const data = await res.json();
    console.log('Backend response:', data); // DEBUG
    console.log('Sent data:', { weight_kg }); // DEBUG
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function deleteWeight(id) {
  const res = await fetch(`${API_URL}/weights/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function updateWeight(id, weight_kg, measured_at) {
  const res = await fetch(`${API_URL}/weights/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ weight_kg, measured_at }),
  });
  return res.json();
}

// ===== BODY MEASUREMENTS =====
export async function getBodyMeasurements() {
  const res = await fetch(`${API_URL}/body-measurements`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function addBodyMeasurement(measurement) {
  const res = await fetch(`${API_URL}/body-measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(measurement),
  });
  return res.json();
}

export async function deleteBodyMeasurement(id) {
  const res = await fetch(`${API_URL}/body-measurements/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function updateBodyMeasurement(id, data) {
  const res = await fetch(`${API_URL}/body-measurements/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}