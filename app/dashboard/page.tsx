"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MessageCircle, ThumbsUp, Star, AlertCircle, Phone, Loader2 } from 'lucide-react';

// Components
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import SentimentChart from '@/components/SentimentChart';
import RecentMentions from '@/components/RecentMentions';
import AddReviewModal from '@/components/AddReviewModal';
import SLAChart from '@/components/SLAChart';
import PlatformSelector from '@/components/PlatformSelector';
import AddPlatformModal from '@/components/AddPlatformModal';
import ConnectCard from '@/components/ConnectCard';
import GoogleConnect from '@/components/GoogleConnect';
import ReviewSummary from '@/components/ReviewSummary'; 

import { MASTER_PLATFORMS } from '@/lib/platforms';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activePlatformIds, setActivePlatformIds] = useState<string[]>(['google', 'booking', 'yelp']);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [allPlatforms, setAllPlatforms] = useState<any[]>(MASTER_PLATFORMS);

  // 1. Auth Check
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 2. Refresh Definitions
  const refreshPlatformDefinitions = () => {
    if (typeof window !== 'undefined') {
      const customDefs = JSON.parse(localStorage.getItem('custom_platform_definitions') || '[]');
      if (customDefs.length > 0) {
        setAllPlatforms([...MASTER_PLATFORMS, ...customDefs]);
      } else {
        setAllPlatforms(MASTER_PLATFORMS);
      }
    }
  };

  // 3. Load Settings
  useEffect(() => {
    refreshPlatformDefinitions();
    const savedActive = localStorage.getItem('my_active_platforms');
    if (savedActive) {
      setActivePlatformIds(JSON.parse(savedActive));
    }
    const savedSelection = localStorage.getItem('current_view_platform');
    if (savedSelection) setSelectedPlatform(savedSelection);
  }, []);

  // 4. Handlers
  const handleSavePlatforms = (newIds: string[]) => {
    setActivePlatformIds(newIds);
    localStorage.setItem('my_active_platforms', JSON.stringify(newIds));
  };

  const handlePlatformChange = (id: string) => {
    setSelectedPlatform(id);
    localStorage.setItem('current_view_platform', id);
  };

  // 5. FETCH REAL DATA FROM API
  useEffect(() => {
    if (status === 'authenticated') {
      async function fetchData() {
        try {
          setLoading(true);
          console.log(`🔄 FETCHING STATS FOR: ${selectedPlatform}...`);

          const platformQuery = selectedPlatform === 'all' ? '' : `&platform=${selectedPlatform}`;

          const res = await fetch(`/api/dashboard/stats?t=${Date.now()}${platformQuery}`, {
            cache: 'no-store'
          });

          if (res.ok) {
            const json = await res.json();
            setData(json);

            // Auto-Add Connected Platforms to Tabs
            if (json.connectedPlatforms) {
               const connectedKeys = Object.keys(json.connectedPlatforms);
               if(connectedKeys.length > 0) {
                  setActivePlatformIds(prev => {
                    const merged = Array.from(new Set([...prev, ...connectedKeys]));
                    localStorage.setItem('my_active_platforms', JSON.stringify(merged));
                    return merged;
                  });
               }
            }
          }
        } catch (error) {
          console.error("Failed to load dashboard data", error);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [status, selectedPlatform]);

  // 6. Loading Screen
  if (status === 'loading' || (loading && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const stats = data || {
    totalMentions: 0,
    positive: 0,
    avgRating: "0.0",
    negative: 0,
    recentMentions: [],
    platformDistribution: [],
    sentimentDistribution: [],
    connectedAccounts: {} 
  };

  const isCurrentPlatformConnected = stats.connectedAccounts?.[selectedPlatform];

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

          {/* PLATFORM TABS */}
          <div className="mb-8">
            <PlatformSelector
              selected={selectedPlatform}
              onSelect={handlePlatformChange}
              activePlatformIds={activePlatformIds}
              onAddClick={() => setIsAddModalOpen(true)}
              allPlatforms={allPlatforms}
            />
          </div>

          {/* CONNECT CARD / STATUS SECTION */}
          <div className="mb-8">
            {selectedPlatform === 'manual' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-48">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-full mb-3"><Phone size={24} /></div>
                <h3 className="font-bold text-gray-700 text-sm">Offline Feedback</h3>
                <p className="text-xs text-gray-400 mt-1">Viewing phone & in-person logs</p>
              </div>
            )}

            {/* Show Connect Card if specific platform selected & NOT connected */}
            {selectedPlatform !== 'all' && selectedPlatform !== 'manual' && !isCurrentPlatformConnected && (
              <div className="max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
                {selectedPlatform === 'google' ? (
                  <GoogleConnect />
                ) : (
                  <ConnectCard
                    platform={selectedPlatform}
                    label={allPlatforms.find(p => p.id === selectedPlatform)?.label || "Platform"}
                    color={selectedPlatform === 'booking' ? "bg-blue-900" : "bg-blue-600"}
                    connectedLabel={undefined} // ✅ FIXED: Changed null to undefined
                  />
                )}
              </div>
            )}
          </div>

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Mentions" value={stats.totalMentions} icon={<MessageCircle size={24} className="text-blue-600" />} color="bg-blue-100" />
            <StatCard title="Positive Feedback" value={stats.positive} icon={<ThumbsUp size={24} className="text-green-600" />} color="bg-green-100" />
            <StatCard title="Avg Rating" value={stats.avgRating} icon={<Star size={24} className="text-yellow-600" />} color="bg-yellow-100" />
            <StatCard title="Negative / Action Needed" value={stats.negative} icon={<AlertCircle size={24} className="text-red-600" />} color="bg-red-100" />
          </div>

          {/* DETAILED CONTENT AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* NEW: Booking.com Detailed Breakdown */}
              {selectedPlatform === 'booking' && isCurrentPlatformConnected && (
                 <div className="animate-in fade-in">
                    <ReviewSummary hotelId={stats.connectedAccounts.booking} />
                 </div>
              )}

              <SLAChart data={stats.platformDistribution || []} />
              <SentimentChart data={stats.sentimentDistribution || []} />
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1">
              <RecentMentions reviews={stats.recentMentions || []} />
            </div>
          </div>

        </main>

        {/* MODAL */}
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