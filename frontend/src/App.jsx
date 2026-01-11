import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Workouts from './components/Workouts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />

      {/* Zašciteno */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
      <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
