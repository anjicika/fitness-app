import React, { useState } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';

export default function AINutritionChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content:
        'Hello! Based on your profile, I can give you personalized nutrition advice. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input;
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/nutrition/advice', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fitnessGoal: 'muscle_gain' }), // Or dynamic based on user selection
      });

      const result = await response.json();
      if (result.success) {
        setMessages((prev) => [...prev, { role: 'ai', content: result.data.advice }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: result.error || 'Missing profile info.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Failed to connect to AI server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 flex flex-col h-[500px]">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-2 font-bold text-gray-700">
        <Bot className="text-blue-600" /> AI Personal Coach
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl max-w-[85%] ${
              m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <Loader2 className="animate-spin text-blue-500 mx-auto" />}
      </div>
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for advice..."
          className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
