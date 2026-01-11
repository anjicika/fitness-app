// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe, login as loginApi, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking auth...');
      const response = await getMe();
      console.log('Auth check response:', response);
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await loginApi({ email, password });
      console.log('Login response:', response);
      
      if (response.success) {
        // Re-check auth after login
        await checkAuth();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 