"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// FIX: Explicitly type the props
export default function SentimentChart({ reviews }: { reviews: any[] }) {

  const sentimentCounts = reviews.reduce((acc: any, r) => {
    const s = (r.sentiment || 'neutral').toLowerCase();
    if (s.includes('positive')) acc[0].value++;
    else if (s.includes('negative')) acc[2].value++;
    else acc[1].value++;
    return acc;
  }, [
    { name: 'Positive', value: 0, color: '#22c55e' }, // Green
    { name: 'Neutral', value: 0, color: '#eab308' },  // Yellow
    { name: 'Negative', value: 0, color: '#ef4444' }  // Red
  ]);

  const activeData = sentimentCounts.filter((d: any) => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4">Sentiment Analysis</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {activeData.map((entry: any, index: number) => (
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