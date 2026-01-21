"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Search, TrendingUp, TrendingDown, Swords, Trophy, Trash2, Plus, Filter, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MASTER_PLATFORMS } from '../../lib/platforms'; 

export default function CompetitorsPage() {
  const router = useRouter();

  // --- 1. STATE ---
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PLATFORM STATE
  const [comparePlatform, setComparePlatform] = useState('all'); 
  const [availablePlatforms, setAvailablePlatforms] = useState<any[]>([]);

  // --- 2. DATA LOADING ---
  useEffect(() => {
    // A. Auth Check
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }

    const type = localStorage.getItem('account_type');
    if (type === 'personal') { router.push('/'); return; }

    // B. Load Competitors
    const savedComps = localStorage.getItem('my_competitors');
    if (savedComps) {
      const parsed = JSON.parse(savedComps);
      setCompetitors(parsed);
      if (parsed.length > 0) setSelectedId(parsed[0].id);
    }

    // C. LOAD USER'S ACTIVE PLATFORMS
    const savedActiveIds = JSON.parse(localStorage.getItem('my_active_platforms') || '[]');
    
    const customDefs = JSON.parse(localStorage.getItem('custom_platform_definitions') || '[]');
    const allKnown = [...MASTER_PLATFORMS, ...customDefs];

    const userPlatforms = savedActiveIds.map((id: string) => {
      const found = allKnown.find(p => p.id === id);
      return found ? { id: found.id, label: found.label } : null;
    }).filter(Boolean);

    setAvailablePlatforms(userPlatforms);
    
    setLoading(false);
  }, [router]);

  // --- 3. HELPER: GENERATE DATA ---
  // FIX: Added ': string' to name and platform
  const generateData = (name: string, platform: string) => {
    let seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    let bias = 0;
    if (['yelp', 'tripadvisor', 'bbb'].includes(platform)) bias = -0.4;
    if (['google', 'facebook', 'linkedin'].includes(platform)) bias = 0.3;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => {
      let me = 4.0 + (i * 0.1) + (Math.sin(i) * 0.1) + bias; 
      const randomOffset = Math.sin(seed + i) * 0.5;
      let them = 4.1 + randomOffset + bias;
      
      me = Math.max(1, Math.min(5, me));
      them = Math.max(1, Math.min(5, them));
      
      return { 
        month, 
        me: parseFloat(me.toFixed(1)), 
        them: parseFloat(them.toFixed(1)) 
      };
    });
  };

  // --- 4. UPDATE CHART ---
  useEffect(() => {
    async function fetchData() {
      if (!selectedId) return;
      const comp = competitors.find(c => c.id === selectedId);
      if (!comp) return;

      try {
        const data = generateData(comp.name, comparePlatform);
        setChartData(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [selectedId, comparePlatform, competitors]); 

  // --- 5. HANDLERS ---
  // FIX: Added ': any' to event e
  const handleAddCompetitor = (e: any) => {
    e.preventDefault();
    if (!searchQuery) return;

    const newComp = {
      id: Date.now(),
      name: searchQuery,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };

    const newList = [...competitors, newComp];
    setCompetitors(newList);
    setSelectedId(newComp.id); 
    setSearchQuery('');
    
    localStorage.setItem('my_competitors', JSON.stringify(newList));
  };

  // FIX: Added ': any' to e, and ': number' to id
  const handleDelete = (e: any, id: number) => {
    e.stopPropagation(); 
    const newList = competitors.filter(c => c.id !== id);
    setCompetitors(newList);
    localStorage.setItem('my_competitors', JSON.stringify(newList));
    
    if (selectedId === id) {
      setSelectedId(newList.length > 0 ? newList[0].id : null);
    }
  };

  const activeCompetitor = competitors.find(c => c.id === selectedId);
  const currentMeScore = chartData.length > 0 ? chartData[chartData.length - 1].me : 0;
  const currentThemScore = chartData.length > 0 ? chartData[chartData.length - 1].them : 0;
  const isWinning = currentMeScore >= currentThemScore;

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20">
          <div className="flex justify-between items-end mb-6">
             <div>
               <h1 className="text-2xl font-bold text-gray-800">Competitor Analysis</h1>
               <p className="text-gray-500">Track your performance against local rivals.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT COLUMN: LIST & SEARCH */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                 <form onSubmit={handleAddCompetitor}>
                   <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Add New Rival</label>
                   <div className="relative flex items-center">
                      <Search className="absolute left-3 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="e.g. Domino's" 
                        className="w-full pl-9 pr-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="submit" className="ml-2 bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors">
                        <Plus size={16} />
                      </button>
                   </div>
                 </form>
               </div>

               <div className="space-y-3">
                  {competitors.map((comp) => (
                    <div 
                      key={comp.id}
                      onClick={() => setSelectedId(comp.id)}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all relative group
                        ${selectedId === comp.id 
                          ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                          : 'bg-white border-gray-200 hover:border-blue-300'
                        }
                      `}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-700 text-sm">{comp.name}</h4>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${comp.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {comp.rating}
                          </span>
                       </div>
                       <p className="text-[10px] text-gray-400">Tracked since today</p>
                       <button 
                         onClick={(e) => handleDelete(e, comp.id)}
                         className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  ))}
                  {competitors.length === 0 && (
                    <div className="text-center py-8 opacity-50 text-sm text-gray-500 italic border-2 border-dashed border-gray-200 rounded-xl">
                       No competitors added yet.
                    </div>
                  )}
               </div>
            </div>

            {/* RIGHT COLUMN: CHARTS & STATS */}
            <div className="lg:col-span-3">
              {activeCompetitor ? (
                <>
                  <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                     <div className="flex items-center gap-2 px-2">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Compare On:</span>
                     </div>
                     
                     <div className="relative w-48">
                        <select 
                          value={comparePlatform}
                          onChange={(e) => setComparePlatform(e.target.value)}
                          className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                           <option value="all">Average Rating</option>
                           {availablePlatforms.map((p) => (
                             <option key={p.id} value={p.id}>
                               {p.label}
                             </option>
                           ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                           <ChevronDown size={16} />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase">My Reputation</p>
                        <div className="flex items-end gap-3 mt-1">
                           <span className="text-3xl font-bold text-gray-800">{currentMeScore}</span>
                           <span className="text-sm font-bold text-green-600 flex items-center mb-1">
                              <TrendingUp size={14} className="mr-1" /> +0.2
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-2 font-bold shadow-inner">VS</div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">{activeCompetitor.name}</p>
                        <div className="flex items-end justify-end gap-3 mt-1">
                           <span className={`text-sm font-bold flex items-center mb-1 ${!isWinning ? 'text-green-600' : 'text-red-500'}`}>
                              {isWinning ? <TrendingDown size={14} className="mr-1"/> : <TrendingUp size={14} className="mr-1"/>}
                              {isWinning ? '-0.1' : '+0.1'}
                           </span>
                           <span className="text-3xl font-bold text-gray-800">{currentThemScore}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-800 mb-6">Reputation History (6 Months)</h3>
                    <div className="h-80 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                             <YAxis domain={[0, 5]} hide />
                             <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                             <Legend />
                             <Line type="monotone" dataKey="me" name="My Business" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} />
                             <Line type="monotone" dataKey="them" name={activeCompetitor.name} stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff'}} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl border flex items-start gap-4 ${isWinning ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className={`p-3 bg-white rounded-lg shadow-sm ${isWinning ? 'text-yellow-500' : 'text-red-500'}`}>
                         {isWinning ? <Trophy size={24} /> : <Swords size={24} />}
                      </div>
                      <div>
                         <h4 className={`font-bold text-sm mb-1 ${isWinning ? 'text-green-900' : 'text-red-900'}`}>
                            {isWinning 
                              ? `You are beating ${activeCompetitor.name}!` 
                              : `${activeCompetitor.name} is ahead.`
                            }
                         </h4>
                         <p className={`text-xs leading-relaxed ${isWinning ? 'text-green-700' : 'text-red-700'}`}>
                            {isWinning 
                               ? "Great job! Your recent reviews are trending higher." 
                               : "Strategy Tip: Focus on getting more 5-star reviews to close the gap."}
                         </p>
                      </div>
                   </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center min-h-[400px]">
                   <Swords size={48} className="text-gray-300 mb-4" />
                   <h3 className="text-gray-500 font-bold text-lg">No Competitor Selected</h3>
                   <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Add a rival using the search bar on the left.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}