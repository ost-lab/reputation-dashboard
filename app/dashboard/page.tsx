"use client";

import { useEffect, useState } from 'react';
import { MessageCircle, ThumbsUp, Star, AlertCircle, Loader2 } from 'lucide-react';

// Components
import StatCard from '@/components/StatCard';
import SentimentChart from '@/components/SentimentChart';
import SLAChart from '@/components/SLAChart';
import RecentMentions from '@/components/RecentMentions';
import GoogleConnect from '@/components/GoogleConnect';
import ConnectCard from '@/components/ConnectCard';
import PlatformSelector from '@/components/PlatformSelector';

const ALL_PLATFORMS = [
  { id: 'google', label: 'Google', color: 'text-blue-500' },
  { id: 'facebook', label: 'Facebook', color: 'text-blue-600' },
  { id: 'instagram', label: 'Instagram', color: 'text-pink-500' },
  { id: 'twitter', label: 'Twitter / X', color: 'text-black' },
  { id: 'linkedin', label: 'LinkedIn', color: 'text-blue-700' },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔄 FETCHING STATS DATA...");
        
        // ✅ FIX 1: Fetch '/api/dashboard/stats', NOT '/api/reviews'
        // ✅ FIX 2: Add timestamp to force fresh data (bypass cache)
        const res = await fetch(`/api/dashboard/stats?t=${Date.now()}`, {
          cache: 'no-store'
        });

        if (res.ok) {
          const json = await res.json();
          console.log("✅ API RESPONSE:", json);
          setData(json);
        } else {
          console.error("❌ API ERROR:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("❌ FETCH FAILED:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8"/>
      </div>
    );
  }

  // Fallback if data is missing
  if (!data) return <div className="p-8">Failed to load data.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen ml-16 md:ml-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* PLATFORM SELECTOR */}
        <PlatformSelector 
          selected={selectedPlatform} 
          onSelect={setSelectedPlatform}
          activePlatformIds={['google']} 
          onAddClick={() => {}} 
          allPlatforms={ALL_PLATFORMS}
        />

        {/* CONNECT CARD */}
        {selectedPlatform !== 'all' && (
           <div className="mt-6 mb-8 max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
             {selectedPlatform === 'google' ? (
               <GoogleConnect />
             ) : (
               <ConnectCard 
                 platform={selectedPlatform}
                 label={ALL_PLATFORMS.find(p => p.id === selectedPlatform)?.label || 'Platform'}
                 color={ALL_PLATFORMS.find(p => p.id === selectedPlatform)?.color || 'text-gray-500'}
               />
             )}
           </div>
        )}
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="TOTAL MENTIONS" value={data.totalMentions || 0} icon={<MessageCircle size={24} className="text-blue-500" />} color="bg-blue-50" />
        <StatCard title="POSITIVE FEEDBACK" value={data.positive || 0} icon={<ThumbsUp size={24} className="text-green-500" />} color="bg-green-50" />
        <StatCard title="AVG RATING" value={data.avgRating || "0.0"} icon={<Star size={24} className="text-yellow-500" />} color="bg-yellow-50" />
        <StatCard title="NEGATIVE / ACTION" value={data.negative || 0} icon={<AlertCircle size={24} className="text-red-500" />} color="bg-red-50" />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ✅ FIX 3: Added fixed height container to prevent Chart Warning */}
        <div className="h-80">
            <SLAChart data={data.platformDistribution || []} /> 
        </div>
        <div className="h-80">
            <SentimentChart data={data.sentimentDistribution || []} />
        </div>
      </div>

      {/* RECENT MENTIONS ROW */}
      <div className="grid grid-cols-1 gap-6">
        {/* ✅ FIX 4: Correctly passing the array from the stats object */}
        <RecentMentions data={data.recentMentions || []} />
      </div>
    </div>
  );
}