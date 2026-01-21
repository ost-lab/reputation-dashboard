"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Code, Layout, Moon, Sun, Copy, Check, Eye } from 'lucide-react';

// FIX: Define the Review structure
interface WidgetReview {
  id?: number;
  user_name: string;
  source: string;
  rating: number;
  text: string;
}

export default function WidgetsPage() {
  // FIX: Apply the interface to state
  const [reviews, setReviews] = useState<WidgetReview[]>([]);
  const [copied, setCopied] = useState(false);

  // Widget Configuration State
  const [config, setConfig] = useState({
    layout: 'carousel', // 'carousel' or 'grid'
    theme: 'light',     // 'light' or 'dark'
    showRating: true,
    showSource: true,
    minStars: 4         // Only show 4+ star reviews
  });

  // 1. Fetch real reviews to show in the preview
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        // FIX: Cast the API response to the array type
        const data: WidgetReview[] = await res.json();
        
        // Now TypeScript knows 'r' is a WidgetReview
        if (Array.isArray(data)) {
            setReviews(data.filter(r => r.rating >= config.minStars).slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to load widget reviews", err);
      }
    }
    fetchReviews();
  }, [config.minStars]);

  // 2. Handle Copy Code
  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(`<script src="https://cdn.reputation-manager.com/widget.js" data-id="YOUR_ID" data-theme="${config.theme}" data-layout="${config.layout}"></script>`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Website Widgets</h1>
          <p className="text-gray-500 mb-8">Embed your best reviews on your website to build trust.</p>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               
               {/* Style Controls */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Layout size={18} /> Design
                  </h3>
                  
                  {/* Layout Select */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Layout</label>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setConfig({...config, layout: 'carousel'})}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg border ${config.layout === 'carousel' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                       >
                         Slider
                       </button>
                       <button 
                         onClick={() => setConfig({...config, layout: 'grid'})}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg border ${config.layout === 'grid' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                       >
                         Grid
                       </button>
                    </div>
                  </div>

                  {/* Theme Select */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Theme</label>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setConfig({...config, theme: 'light'})}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 ${config.theme === 'light' ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-200'}`}
                       >
                         <Sun size={16} /> Light
                       </button>
                       <button 
                         onClick={() => setConfig({...config, theme: 'dark'})}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-2 ${config.theme === 'dark' ? 'bg-gray-800 border-gray-900 text-white' : 'bg-white border-gray-200'}`}
                       >
                         <Moon size={16} /> Dark
                       </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Filter Content</label>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm text-gray-700">Minimum Rating</span>
                       <select 
                         className="border rounded p-1 text-sm bg-gray-50"
                         value={config.minStars}
                         onChange={(e) => setConfig({...config, minStars: Number(e.target.value)})}
                       >
                         <option value="3">3+ Stars</option>
                         <option value="4">4+ Stars</option>
                         <option value="5">5 Stars Only</option>
                       </select>
                    </div>
                  </div>
               </div>

               {/* Code Snippet */}
               <div className="bg-blue-900 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Code size={18} /> Embed Code
                  </h3>
                  <p className="text-blue-200 text-xs mb-4">Paste this into your website's {`<head>`} or {`<body>`}.</p>
                  
                  <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-green-400 break-all mb-4 border border-white/10">
                    &lt;script src="widget.js" data-theme="{config.theme}" data-layout="{config.layout}"&gt;&lt;/script&gt;
                  </div>

                  <button 
                    onClick={handleCopy}
                    className="w-full py-2 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
               </div>

            </div>

            {/* RIGHT COLUMN: Live Preview */}
            <div className="w-full lg:w-2/3">
               <div className="bg-gray-200 rounded-xl border-4 border-gray-300 border-dashed p-8 min-h-[500px] flex flex-col items-center justify-center relative">
                  <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-gray-500 flex items-center gap-1 backdrop-blur-sm">
                     <Eye size={12} /> Live Preview
                  </div>

                  {/* THE WIDGET MOCKUP */}
                  <div className={`
                    w-full max-w-2xl p-6 rounded-xl shadow-2xl transition-all duration-500
                    ${config.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}
                  `}>
                     <div className="flex justify-between items-end mb-6 border-b border-gray-100/10 pb-4">
                        <div>
                           <h2 className="font-bold text-xl">Our Customers Love Us</h2>
                           <div className="text-yellow-400 text-sm">★★★★★ <span className={`text-xs ml-2 opacity-70 ${config.theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Based on {reviews.length} reviews</span></div>
                        </div>
                        <div className="text-xs font-bold opacity-50">Powered by RM</div>
                     </div>

                     <div className={`
                       ${config.layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex gap-4 overflow-x-auto pb-4 snap-x'}
                     `}>
                        {reviews.map((r, i) => (
                          <div key={i} className={`
                            p-4 rounded-lg border min-w-[250px] flex-1
                            ${config.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}
                          `}>
                             <div className="flex justify-between mb-2">
                                <span className="font-bold text-sm">{r.user_name}</span>
                                {config.showSource && <span className="text-[10px] uppercase opacity-60 tracking-wider">{r.source}</span>}
                             </div>
                             <div className="text-yellow-400 text-xs mb-2">{'★'.repeat(r.rating)}</div>
                             <p className={`text-sm line-clamp-3 italic ${config.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>"{r.text}"</p>
                          </div>
                        ))}
                        
                        {reviews.length === 0 && (
                          <div className="text-center w-full py-8 opacity-50 italic">
                             Add more 4-5 star reviews to see them here!
                          </div>
                        )}
                     </div>
                  </div>

               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}