
import React from 'react';
import Navbar from './Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome athlete!</h1>
        <p className="text-center text-gray-600">
          This is your home page.
        </p>
        
        {/* Tukaj pride vsebina za home page */}
      </main>
    </div>
  );
}