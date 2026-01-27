"use client";

import { MessageCircle, Star, Calendar } from 'lucide-react';

export default function RecentMentions({ data }: { data: any[] }) {
  
  // Safe check: If data is missing or empty
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-3">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Mentions</h3>
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p>No recent reviews found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-3">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Mentions</h3>
      
      <div className="space-y-6">
        {data.map((review, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {review.author_name ? review.author_name[0].toUpperCase() : "?"}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{review.author_name || "Unknown Author"}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {review.platform || "System"}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                  <span className="font-bold text-yellow-700 mr-1">{review.rating}</span>
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {review.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}