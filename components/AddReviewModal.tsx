"use client";

import { useState } from 'react';
import { Plus, X, Star } from 'lucide-react';

// FIX: Define Props
interface AddReviewModalProps {
  onReviewAdded: () => void;
}

export default function AddReviewModal({ onReviewAdded }: AddReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    user_name: '',
    rating: 5,
    text: '',
    source: 'Manual'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ user_name: '', rating: 5, text: '', source: 'Manual' });
        onReviewAdded(); // Refresh parent
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus size={16} /> Add Review
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800">Add Manual Review</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
            <input 
              required
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. John Doe"
              value={formData.user_name}
              onChange={e => setFormData({...formData, user_name: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rating</label>
             <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   type="button"
                   onClick={() => setFormData({...formData, rating: star})}
                   className={`p-1 rounded-md transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                 >
                   <Star fill="currentColor" size={24} />
                 </button>
               ))}
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Review Text</label>
            <textarea 
              required
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="What did they say?"
              value={formData.text}
              onChange={e => setFormData({...formData, text: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-md transition-all">
            Save Review
          </button>
        </form>
      </div>
    </div>
  );
}