import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import MealPlanner from './MealPlanner';
import AINutritionChat from './AINutritionChat';

export default function Nutrition() {
  const [calorieData, setCalorieData] = useState({ dailyCalories: 0, target: 2200 });

  useEffect(() => {
    const fetchCalorieNeeds = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/v1/nutrition/calories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success) {
          setCalorieData({
            dailyCalories: result.data.dailyCalories,
            target: result.data.dailyCalories, // Set target as calculated by AI
          });
        }
      } catch (err) {
        console.error('Failed to load calorie data', err);
      }
    };
    fetchCalorieNeeds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Nutrition & AI Coach</h1>
          <p className="text-gray-600">Smart meal analysis and personalized AI advice</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="basis-1/3 space-y-6">
            {/* Daily Summary Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recommended Daily Intake
              </h3>
              <div className="text-3xl font-bold text-gray-800 mt-1">
                {calorieData.dailyCalories}{' '}
                <span className="text-sm font-normal text-gray-500">kcal / day</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">
                Calculated based on your profile stats
              </p>
            </div>

            <MealPlanner />
          </div>

          <div className="basis-2/3">
            <AINutritionChat />
          </div>
        </div>
      </main>
    </div>
  );
}
