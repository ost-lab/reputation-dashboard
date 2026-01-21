"use client";
import PlatformIcon from './PlatformIcon';

// CHANGED: Now accepts 'data' prop from the parent (Dashboard)
export default function RecentMentions({ data = [] }) {
  
  // Use the passed data. If none is passed, default to empty array.
  const mentions = data;

  if (!mentions || mentions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex items-center justify-center text-gray-400">
        <p>No reviews found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-0 rounded-lg shadow-sm border border-gray-100 h-full max-h-[40rem] overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <h3 className="font-bold text-gray-700">RECENT MENTIONS (Live)</h3>
      </div>
      <div className="divide-y">
        {mentions.map((m) => {
          const displayName = m.user_name || m.user || "Anonymous";
          
          return (
            <div key={m.id} className="p-4 hover:bg-gray-50 transition-colors border-b last:border-0">
              <div className="flex items-start gap-3 mb-2">
                
                {/* 1. PLATFORM ICON (Replaces generic avatar) */}
                <div className="mt-1">
                   <PlatformIcon source={m.source} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-sm font-bold text-gray-800">{displayName}</h4>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide">
                          {m.source}
                        </span>
                     </div>
                     {/* 2. STARS DISPLAY */}
                     <span className="text-yellow-400 font-bold text-xs tracking-widest">
                       {'★'.repeat(m.rating || 0)}
                       <span className="text-gray-200">{'★'.repeat(5 - (m.rating || 0))}</span>
                     </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2 mb-2 leading-relaxed">"{m.text}"</p>
                  
                  {/* 3. SENTIMENT BADGE */}
                  {/* <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${m.sentiment === 'positive' ? 'bg-green-500' : m.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                      <span className="text-xs text-gray-500 capitalize">{m.sentiment || 'Neutral'}</span>
                  </div> */}
                  <div className="flex items-center gap-2">
                      {(() => {
                        // Normalize the sentiment string
                        const s = (m.sentiment || 'neutral').toLowerCase().trim();
                        
                        let colorClass = 'bg-yellow-500'; // Default Neutral
                        if (s.includes('positive')) colorClass = 'bg-green-500';
                        if (s.includes('negative')) colorClass = 'bg-red-500';

                        return <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>;
                      })()}
                      
                      <span className="text-xs text-gray-500 capitalize">
                        {m.sentiment || 'Neutral'}
                      </span>
                  </div>

                  {/* 4. AI REPLY BOX */}
                  {m.ai_reply && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg relative">
                       {/* Little arrow pointing up */}
                       <div className="absolute top-[-6px] left-4 w-3 h-3 bg-indigo-50 border-t border-l border-indigo-100 transform rotate-45"></div>
                       <strong className="block text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                         ✨ AI Suggested Reply
                       </strong>
                       <p className="text-xs text-indigo-800 leading-relaxed">{m.ai_reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}