"use client"; 

import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import SentimentChart from '../components/SentimentChart';
import RecentMentions from '../components/RecentMentions';
import AddReviewModal from '../components/AddReviewModal';
import SLAChart from '../components/SLAChart';
import PlatformSelector from '../components/PlatformSelector';
import AddPlatformModal from '../components/AddPlatformModal';
import ConnectCard from '../components/ConnectCard';
import { MASTER_PLATFORMS } from '../lib/platforms';
import { MessageCircle, ThumbsUp, Star, AlertCircle, Phone } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  
  // FIX: Explicitly type state variables
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all'); 
  const [activePlatformIds, setActivePlatformIds] = useState<string[]>(['google', 'facebook', 'yelp']);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [allPlatforms, setAllPlatforms] = useState<any[]>(MASTER_PLATFORMS);

  // 1. Auth Check
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login'); 
    }
  }, [router]);

  // 2. Refresh Definitions
  const refreshPlatformDefinitions = () => {
    const customDefs = JSON.parse(localStorage.getItem('custom_platform_definitions') || '[]');
    if (customDefs.length > 0) {
      setAllPlatforms([...MASTER_PLATFORMS, ...customDefs]);
    } else {
      setAllPlatforms(MASTER_PLATFORMS);
    }
  };

  // 3. Load on Mount
  useEffect(() => {
    refreshPlatformDefinitions();

    const savedActive = localStorage.getItem('my_active_platforms');
    if (savedActive) {
      setActivePlatformIds(JSON.parse(savedActive));
    } else {
       const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
       const industry = settings.industry;

       let defaultPlatforms = ['google', 'facebook']; 
       if (industry === 'food') defaultPlatforms.push('yelp', 'tripadvisor');
       else if (industry === 'health') defaultPlatforms.push('healthgrades', 'vitals');
       else if (industry === 'realestate') defaultPlatforms.push('zillow', 'realtor');
       else if (industry === 'other') defaultPlatforms.push('custom'); 
       
       if (!industry) defaultPlatforms = ['instagram', 'twitter', 'linkedin']; // Personal defaults

       setActivePlatformIds(defaultPlatforms);
    }

    const savedSelection = localStorage.getItem('current_view_platform');
    if (savedSelection) setSelectedPlatform(savedSelection);
  }, []);

  // 4. Handlers
  // FIX: Added type 'string[]'
  const handleSavePlatforms = (newIds: string[]) => {
    setActivePlatformIds(newIds);
    localStorage.setItem('my_active_platforms', JSON.stringify(newIds));
  };

  // FIX: Added type 'string'
  const handlePlatformChange = (id: string) => {
    setSelectedPlatform(id);
    localStorage.setItem('current_view_platform', id);
  };

  // 5. Fetch Data
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
           const data = await res.json();
           setReviews(data);
        }
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const filteredReviews = selectedPlatform === 'all' 
    ? reviews 
    : reviews.filter(r => (r.source || "").toLowerCase().includes(selectedPlatform.replace('custom-', ''))); 

  const totalReviews = filteredReviews.length;
  const avgRating = totalReviews > 0 ? (filteredReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / totalReviews).toFixed(1) : "0.0";
  const sentimentCounts = filteredReviews.reduce((acc, r) => {
    const s = (r.sentiment || 'neutral').toLowerCase().trim();
    let key = 'neutral';
    if (s.includes('positive')) key = 'positive';
    else if (s.includes('negative')) key = 'negative';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8 ml-16 md:ml-20">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
             <AddReviewModal onReviewAdded={() => window.location.reload()} />
          </div>

          <div className="mb-8">
            <PlatformSelector 
               selected={selectedPlatform} 
               onSelect={handlePlatformChange}
               activePlatformIds={activePlatformIds}
               onAddClick={() => setIsAddModalOpen(true)}
               allPlatforms={allPlatforms} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
             {selectedPlatform === 'manual' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-48">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-full mb-3"><Phone size={24} /></div>
                    <h3 className="font-bold text-gray-700 text-sm">Offline Feedback</h3>
                    <p className="text-xs text-gray-400 mt-1">Viewing phone & in-person logs</p>
                </div>
             )}
             {selectedPlatform !== 'all' && selectedPlatform !== 'manual' && (
                <ConnectCard 
                  platform={selectedPlatform} 
                  label={allPlatforms.find(p => p.id === selectedPlatform)?.label || "Platform"} 
                  color="bg-blue-600"
                />
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Mentions" value={totalReviews} icon={<MessageCircle size={24} className="text-blue-600"/>} color="bg-blue-100" />
            <StatCard title="Positive Feedback" value={sentimentCounts.positive} icon={<ThumbsUp size={24} className="text-green-600"/>} color="bg-green-100" />
            <StatCard title="Avg Rating" value={avgRating} icon={<Star size={24} className="text-yellow-600"/>} color="bg-yellow-100" />
            <StatCard title="Negative / Action Needed" value={sentimentCounts.negative} icon={<AlertCircle size={24} className="text-red-600"/>} color="bg-red-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
               <SLAChart reviews={filteredReviews} />
               <SentimentChart reviews={filteredReviews} />
            </div>
            <div className="lg:col-span-1">
               <RecentMentions data={filteredReviews} />
            </div>
          </div>
        </main>
        {isAddModalOpen && (
          <AddPlatformModal 
            currentIds={activePlatformIds}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleSavePlatforms}
            onCustomAdded={refreshPlatformDefinitions}
          />
        )}
      </div>
    </div>
  );
}