const API_URL = 'http://localhost:3000/api/v1/statistics';
function getToken() {
  return localStorage.getItem('token');
}

export async function getWeightStatistics(period = 30) {
  const res = await fetch(`${API_URL}?period=${period}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

