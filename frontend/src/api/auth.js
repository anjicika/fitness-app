const API_URL = 'http://localhost:3000/api/v1/auth';

export async function login({ email, password }) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    // Store token if login is successful
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      console.log('Token stored:', data.token.substring(0, 20) + '...'); // Debug log
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error' };
  }
}

export async function getMe() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found in localStorage');
    return { success: false, message: 'No token found' };
  }
  
  try {
    console.log('Making getMe request with token:', token.substring(0, 20) + '...'); // Debug log
    const res = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await res.json();
    console.log('getMe response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('getMe error:', error);
    return { success: false, message: 'Network error' };
  }
}

export async function logout() {
  const token = localStorage.getItem('token');
  
  try {
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token from localStorage
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  }
  
  return { success: true };
}