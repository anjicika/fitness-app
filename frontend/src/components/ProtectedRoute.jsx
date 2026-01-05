import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Uporabnik ni prijavljen, redirect na login
    return <Navigate to="/login" replace />;
  }

  return children; // Uporabnik ima token, pokaži stran
}
