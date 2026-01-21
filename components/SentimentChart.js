"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SentimentChart({ reviews = [] }) {
  
  // 1. Calculate Data from Props
  const sentimentCounts = reviews.reduce((acc, r) => {
    const s = r.sentiment || 'neutral'; // 'positive', 'negative', or 'neutral'
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  // 2. Format for Recharts
  const data = [
    { name: 'Positive', value: sentimentCounts.positive, color: '#4ade80' }, // Green
    { name: 'Neutral', value: sentimentCounts.neutral, color: '#94a3b8' },   // Gray
    { name: 'Negative', value: sentimentCounts.negative, color: '#f87171' }  // Red
  ];

  // Prevent empty chart if no data
  if (reviews.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-80 flex flex-col items-center justify-center text-gray-400">
        <p>No data yet</p>
        <p className="text-xs">Add a review to see the chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-700 mb-4">Sentiment Analysis</h3>
      
      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}