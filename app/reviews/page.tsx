"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Search, Star, Filter, Loader2 } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Fetch Reviews on Load
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews"); // Calls the file we made in Step 1
        if (res.ok) {
           const data = await res.json();
           setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // 2. Client-Side Filter Logic
  const filteredReviews = reviews.filter(r => 
      (r.content || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.author_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8 ml-16 md:ml-20">
          
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">All Reviews</h1>
             <div className="text-sm text-gray-500">
                Total: {filteredReviews.length}
             </div>
          </div>

          {/* SEARCH BAR */}
          <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search reviews by content or customer..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
               <div className="col-span-3">Customer</div>
               <div className="col-span-5">Review</div>
               <div className="col-span-2">Platform</div>
               <div className="col-span-2 text-right">Rating</div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-2" />
                    Loading reviews...
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredReviews.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    No reviews found.
                </div>
            )}

            {/* Rows */}
            {!loading && filteredReviews.map((review) => (
                <div key={review.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors items-start text-sm">
                   
                   {/* 1. CUSTOMER */}
                   <div className="col-span-3 flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                          {(review.author_name || "A").charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{review.author_name || "Anonymous"}</p>
                          <p className="text-xs text-gray-400">
                             {new Date(review.created_at).toLocaleDateString()}
                          </p>
                       </div>
                   </div>

                   {/* 2. REVIEW CONTENT */}
                   <div className="col-span-5">
                       <p className="text-gray-600 line-clamp-3 text-xs leading-relaxed whitespace-pre-wrap">
                          {(review.content || "").replace(/^"|"$/g, '')}
                       </p>
                   </div>

                   {/* 3. PLATFORM */}
                   <div className="col-span-2 flex items-center gap-2">
                       <div className="scale-75 origin-left">
                           <PlatformIcon source={review.platform || "custom"} />
                       </div>
                       <span className="capitalize text-gray-500 text-xs">{review.platform}</span>
                   </div>

                   {/* 4. RATING */}
                   <div className="col-span-2 flex justify-end">
                       <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                           Number(review.rating) >= 4 ? 'bg-green-100 text-green-700' : 
                           Number(review.rating) <= 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                       }`}>
                           {Number(review.rating).toFixed(1)} <Star size={12} fill="currentColor" />
                       </div>
                   </div>
                </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}