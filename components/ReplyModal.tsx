"use client";
import { useState, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

// FIX: Define Props
interface ReplyModalProps {
  review: any; // Using any for simplicity since DB structure varies, but usually: { id, user_name, text, admin_reply }
  onClose: () => void;
  onReplySaved: () => void;
}

export default function ReplyModal({ review, onClose, onReplySaved }: ReplyModalProps) {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (review) {
      setReplyText(review.admin_reply || review.ai_reply || "");
    }
  }, [review]);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, reply: replyText }),
      });

      if (res.ok) {
        onReplySaved(); 
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!review) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        
        <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r flex flex-col">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Replying to:</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
              {review.user_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">{review.user_name}</p>
              <p className="text-xs text-gray-500">{review.source}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-60">
             <p className="text-sm text-gray-600 italic">"{review.text}"</p>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" /> 
              Draft Response
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <textarea 
            className="flex-1 w-full border rounded-lg p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50 h-40 mb-4"
            placeholder="Write your reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          ></textarea>

          <div className="flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">
               Cancel
             </button>
             <button 
               onClick={handleSend}
               disabled={loading}
               className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md"
             >
               {loading ? 'Sending...' : <><Send size={16} /> Post Reply</>}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}