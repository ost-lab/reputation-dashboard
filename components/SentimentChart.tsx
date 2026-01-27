"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  positive: '#22c55e', // Green
  neutral: '#eab308',  // Yellow
  negative: '#ef4444'  // Red
};

// ✅ FIX: Default 'data' to an empty array to prevent the crash
export default function SentimentChart({ data = [] }: { data?: any[] }) {

  // Guard Clause: If data is empty, show a fallback message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-64 flex items-center justify-center text-gray-400">
        No sentiment data available
      </div>
    );
  }

  // Safely map only if data exists
  const chartData = data.map(item => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1), 
    value: Number(item.value),
    color: COLORS[item.name as keyof typeof COLORS] || '#9ca3af'
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4">Sentiment Analysis</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
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