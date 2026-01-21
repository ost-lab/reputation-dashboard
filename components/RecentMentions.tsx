"use client";

import { MessageSquare, Star } from 'lucide-react';

// FIX: Define Props
export default function RecentMentions({ data }: { data: any[] }) {
  
  const recent = data.slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-blue-500"/> Recent Mentions
      </h3>
      
      <div className="space-y-4">
        {recent.map((review, i) => (
          <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
             <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-gray-700">{review.author || "Anonymous"}</span>
                <span className="text-[10px] text-gray-400">{review.date || "Just now"}</span>
             </div>
             <div className="flex text-yellow-400 mb-1">
                {[...Array(5)].map((_, idx) => (
                   <Star key={idx} size={10} fill={idx < (review.rating || 0) ? "currentColor" : "none"} className={idx < (review.rating || 0) ? "" : "text-gray-200"} />
                ))}
             </div>
             <p className="text-xs text-gray-500 line-clamp-2 italic">"{review.text || "No content"}"</p>
          </div>
        ))}
        
        {recent.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">
            No recent mentions found.
          </div>
        )}
      </div>
    </div>
  );
}