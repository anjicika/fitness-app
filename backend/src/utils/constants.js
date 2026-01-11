export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const WORKOUT_TYPES = [
  { value: 'cardio', label: 'Kardio', color: '#0088FE', icon: '🏃' },
  { value: 'strength', label: 'Snaga', color: '#00C49F', icon: '🏋️' },
  { value: 'yoga', label: 'Joga', color: '#FFBB28', icon: '🧘' },
  { value: 'other', label: 'Ostalo', color: '#FF8042', icon: '⚡' },
];

export const CHART_COLORS = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  warning: '#f39c12',
  success: '#27ae60',
  danger: '#e74c3c',
  info: '#3498db',
};

export const GOAL_TYPES = {
  WORKOUTS: 'workouts',
  CALORIES: 'calories',
  STREAK: 'streak',
  DURATION: 'duration',
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};