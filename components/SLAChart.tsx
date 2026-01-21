"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SLAChart({ reviews = [] }) {
  
  // 1. Process Data: Group by Source and count Replied vs Pending
  const dataMap = reviews.reduce((acc, r) => {
    const source = r.source || "Manual";
    
    if (!acc[source]) {
      acc[source] = { name: source, replied: 0, pending: 0 };
    }

    // If 'ai_reply' exists (or a real reply), we count it as "Replied"
    if (r.ai_reply) {
      acc[source].replied += 1;
    } else {
      acc[source].pending += 1;
    }

    return acc;
  }, {});

  // Convert Object to Array for Recharts
  const data = Object.values(dataMap);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-80 flex flex-col items-center justify-center text-gray-400">
        <p>No data available for SLA.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-80">
      <h3 className="font-bold text-gray-700 mb-4">Response SLA (Replied vs Pending)</h3>
      
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle"/>
            
            {/* Stacked Bars */}
            <Bar dataKey="replied" name="Replied (AI)" stackId="a" fill="#4ade80" radius={[0, 0, 4, 4]} />
            <Bar dataKey="pending" name="Pending" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}