"use client";
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function AddReviewModal({ onReviewAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // CHANGED: Using 'user_name' to match DB exactly
  const [formData, setFormData] = useState({ 
    user_name: '', 
    source: 'Manual', 
    text: '', 
    rating: 5 
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      setIsOpen(false);
      // Reset form
      setFormData({ user_name: '', source: 'Manual', text: '', rating: 5 }); 
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"
      >
        <Plus size={16} /> Add Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg text-gray-800">Add Manual Review</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                <input 
                  placeholder="e.g. John Doe" 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 outline-none focus:border-blue-500"
                  value={formData.user_name} 
                  onChange={e => setFormData({...formData, user_name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Rating</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 outline-none focus:border-blue-500"
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: e.target.value})}
                >
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★ (4 Stars)</option>
                  <option value="3">★★★ (3 Stars)</option>
                  <option value="2">★★ (2 Stars)</option>
                  <option value="1">★ (1 Star)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Review Content</label>
                <textarea 
                  placeholder="What did they say?" 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 h-24 outline-none focus:border-blue-500"
                  value={formData.text}
                  onChange={e => setFormData({...formData, text: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
              >
                {loading ? "Analyzing & Saving..." : "Save Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}