import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/workouts', label: 'Workouts' },
    { path: '/nutrition', label: 'Nutrition' },
    { path: '/forum', label: 'Forum' },
  ];

  return (
    <nav className="bg-blue-500 text-white px-8 py-4 flex justify-between items-center font-semibold shadow-md">
      <div className="flex gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`hover:text-blue-200 transition ${
              isActive(link.path) ? 'border-b-2 border-white' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
      >
        Logout
      </button>
    </nav>
  );
}
