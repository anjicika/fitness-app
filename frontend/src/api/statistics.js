const API_URL = 'http://localhost:3000/api/v1/statistics';

function getToken() {
  return localStorage.getItem('token');
}

export async function getWeightStatistics(period = 30, metric = 'weight', type) {
  const params = new URLSearchParams({ period, metric });
  if (metric === 'measurement' && type) params.append('type', type);

  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store', // ← prepreči 304
  });

  return res.json();
}
