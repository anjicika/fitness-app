// frontend/src/api/statistics.js
const API_URL = 'http://localhost:3000/api/v1/statistics';

function getToken() {
  return localStorage.getItem('token');
}

export async function getWeightStatistics(period = 30) {
  const params = new URLSearchParams({ period, metric: 'weight' });

  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store',
  });
  return res.json();
}

export async function getMeasurementStatistics(period = 30, type) {
  const params = new URLSearchParams({ period, metric: 'measurement' });
  if (type) params.append('type', type);

  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store',
  });
  return res.json();
}
