"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import PlatformIcon from '../../components/PlatformIcon';
import ReplyModal from '../../components/ReplyModal'; 
import { Trash2, Search, Reply, CheckCircle } from 'lucide-react';

// Define the shape of a Review based on your Database Schema
interface Review {
  id: number;
  user_name: string; // Matches DB column
  source: string;
  rating: number;
  date: string;
  text: string;
  admin_reply?: string; // Matches DB column
  status?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // STATE FOR REPLY MODAL
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  // 1. FETCH FROM API (Database)
  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews'); 
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  }

  // 2. DELETE VIA API
  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Refresh data from DB to ensure UI is in sync
        fetchReviews();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filteredReviews = reviews.filter(r => 
    (r.text || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">All Reviews</h1>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
             <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border w-full max-w-md">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                   <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase w-1/3">Review</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase w-1/3">Your Reply</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {filteredReviews.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 group">
                         <td className="p-4 align-top">
                            <div className="flex items-center gap-3 mb-1">
                               <PlatformIcon source={r.source} />
                               <span className="font-bold text-gray-800 text-sm">{r.user_name}</span>
                            </div>
                            <div className="text-xs text-yellow-500 flex">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < r.rating ? "text-yellow-500" : "text-gray-200"}>★</span>
                                ))}
                            </div>
                         </td>
                         <td className="p-4 align-top">
                            <p className="text-sm text-gray-600 line-clamp-3">{r.text}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(r.date).toLocaleDateString()}</p>
                         </td>
                         <td className="p-4 align-top">
                            {r.admin_reply ? (
                               <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                  <div className="flex items-center gap-2 mb-1">
                                     <CheckCircle size={12} className="text-green-600" />
                                     <span className="text-xs font-bold text-green-700">Replied</span>
                                  </div>
                                  <p className="text-xs text-green-800 italic line-clamp-2">"{r.admin_reply}"</p>
                               </div>
                            ) : (
                               <span className="text-xs text-gray-400 italic">No reply yet.</span>
                            )}
                         </td>
                         <td className="p-4 text-right align-top">
                            <div className="flex justify-end gap-2">
                               {/* REPLY BUTTON */}
                               <button 
                                 onClick={() => setSelectedReview(r)}
                                 className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                               >
                                 <Reply size={14} /> Reply
                               </button>

                               {/* DELETE BUTTON */}
                               <button 
                                 onClick={() => handleDelete(r.id)}
                                 className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                   {filteredReviews.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400">
                            {reviews.length === 0 ? "Loading reviews from database..." : "No reviews match your search."}
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </main>
      </div>

      {/* RENDER THE MODAL IF A REVIEW IS SELECTED */}
      {selectedReview && (
        <ReplyModal 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)} 
          onReplySaved={() => {
             fetchReviews(); // Refresh table data from DB
             setSelectedReview(null);
          }} 
        />
      )}
    </div>
  );
}