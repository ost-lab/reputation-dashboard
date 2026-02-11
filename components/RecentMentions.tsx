"use client";
import { Star, MessageCircle, MapPin, BedDouble } from "lucide-react";
import PlatformIcon from "./PlatformIcon"; // Ensure you have this helper!

interface Review {
  id: number;
  author_name: string;
  rating: number;
  content: string;
  platform: string;
  created_at: Date;
}

export default function RecentMentions({ reviews }: { reviews: Review[] }) {
  
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm text-center text-gray-500 h-64 flex flex-col items-center justify-center">
        <MessageCircle className="mb-2 opacity-50" size={32} />
        <p className="text-sm">No reviews yet.</p>
        <p className="text-xs">Connect a platform to sync.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm divide-y">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              {/* Dynamic Icon Helper */}
              <div className="scale-75 origin-left">
                 <PlatformIcon source={review.platform} />
              </div>
              
              <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-900 line-clamp-1">
                    {review.author_name}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {review.platform} • {new Date(review.created_at).toLocaleDateString()}
                  </span>
              </div>
            </div>
            
            {/* Rating Badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                Number(review.rating) >= 4 ? 'bg-green-50 text-green-700' : 
                Number(review.rating) <= 2 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {Number(review.rating).toFixed(1)} <Star size={10} fill="currentColor" />
            </div>
          </div>

          <p className="text-xs text-gray-600 line-clamp-3 mt-2">
            {/* Clean up quotes if scraper added them */}
            {review.content.replace(/^"|"$/g, '')} 
          </p>
        </div>
      ))}
      
      <div className="p-3 text-center border-t">
        <button className="text-xs text-blue-600 font-medium hover:underline">
            View All Reviews
        </button>
      </div>
    </div>
  );
}