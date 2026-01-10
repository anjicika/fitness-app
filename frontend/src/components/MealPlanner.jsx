import React, { useState } from 'react';
import { Utensils, Loader2, Star } from 'lucide-react';

export default function MealPlanner() {
  const [mealDescription, setMealDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyzeMeal = async (e) => {
    e.preventDefault();
    if (!mealDescription.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/nutrition/analyze-meal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealDescription })
      });
      const result = await response.json();
      if (result.success) setAnalysis(result.data.analysis);
    } catch (err) {
      console.error("Meal analysis error:", err);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Utensils className="text-green-500 w-5 h-5" /> Analyze Meal</h3>
      <form onSubmit={handleAnalyzeMeal} className="space-y-3">
        <textarea 
          value={mealDescription}
          onChange={(e) => setMealDescription(e.target.value)}
          placeholder="e.g. 200g Grilled salmon with broccoli" 
          className="w-full p-2 border rounded-lg h-20 text-sm" 
        />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex justify-center items-center">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Analyze with AI'}
        </button>
      </form>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-700">{analysis.mealName}</span>
            <span className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded text-yellow-700">
              <Star size={14} fill="currentColor" /> {analysis.healthScore}/10
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white p-2 rounded border text-center">
              <div className="text-xs text-gray-500 uppercase">Calories</div>
              <div className="font-bold">{analysis.totalCalories} kcal</div>
            </div>
            <div className="bg-white p-2 rounded border text-center">
              <div className="text-xs text-gray-500 uppercase">Protein</div>
              <div className="font-bold text-blue-600">{analysis.protein}g</div>
            </div>
          </div>
          <p className="italic text-gray-600 text-xs">"{analysis.suggestions}"</p>
        </div>
      )}
    </div>
  );
}