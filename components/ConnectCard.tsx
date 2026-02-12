"use client";
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Loader2, Link as LinkIcon, LogOut } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

interface ConnectCardProps {
  platform: string;
  label: string;
  color: string;
  // ✅ NEW: Accept the real connected name from the Database
  connectedLabel?: string; 
}

export default function ConnectCard({ platform, label, color, connectedLabel }: ConnectCardProps) {
  const storageKey = `${platform}_connected`; 
  const urlKey = `${platform}_url`; 
  
  const [isConnected, setIsConnected] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    // 1. PRIORITY: If DB has a label (passed via props), use it!
    if (connectedLabel) {
        setIsConnected(true);
        setAccountName(connectedLabel);
        return;
    }

    // 2. FALLBACK: Check Local Storage (for instant UI feedback before DB loads)
    const savedName = localStorage.getItem(storageKey);
    const savedUrl = localStorage.getItem(urlKey);
    
    if (savedName) {
      setIsConnected(true);
      setAccountName(savedName);
      if (savedUrl) setInputUrl(savedUrl);
    }
  }, [platform, storageKey, urlKey, connectedLabel]); 

  const handleConnect = async () => {
    if (!inputUrl) return alert("Please paste a link first.");
    
    setStatus('connecting');
    
    // We simulate a connection here, but the real save happens on Sync usually
    // or you can call an API here to save the URL immediately.
    setTimeout(() => {
      setIsConnected(true);
      // Temporary name until Sync runs and gets the real one
      const tempName = "Connected Profile"; 
      setAccountName(tempName);
      
      // Save locally for speed
      localStorage.setItem(storageKey, tempName);
      localStorage.setItem(urlKey, inputUrl); 
      
      setStatus('idle');
    }, 1000);
  };

  const handleDisconnect = () => {
    if(!confirm("Disconnect this account?")) return;
    
    // Clear Local Storage
    localStorage.removeItem(storageKey);
    localStorage.removeItem(urlKey);
    
    // TODO: You might want to add an API call here to delete from DB:
    // fetch('/api/disconnect', { method: 'POST', body: ... })
    
    setIsConnected(false);
    setAccountName('');
    setInputUrl('');
  };

  const handleSync = async () => {
    setStatus('syncing');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform: platform,
          url: inputUrl 
        }) 
      });

      if (res.ok) {
        const data = await res.json();
        
        setStatus('success');
        
        // ✅ IF SERVER FOUND A REAL NAME (e.g. "Toronto Condo Kings"), UPDATE IT
        // We assume the backend might return { connectedLabel: "Name" } in the response
        // If not, we just reload to fetch the fresh DB state.
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus('idle');
        alert("Sync failed. Please check the URL.");
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className={`bg-green-50 p-6 rounded-lg shadow-sm border border-green-200 flex flex-col items-center justify-center text-center h-48`}>
        <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3 animate-bounce">
          <CheckCircle size={24} />
        </div>
        <h3 className="font-bold text-green-800 text-sm">Sync Complete!</h3>
        <p className="text-xs text-green-600 mt-1">New reviews added.</p>
      </div>
    );
  }

  // --- NOT CONNECTED STATE ---
  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-auto flex flex-col justify-center transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="mt-1">
             <PlatformIcon source={platform} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Connect {label}</h3>
            <p className="text-xs text-gray-500">Paste your profile link below</p>
          </div>
        </div>

        <input 
          type="text" 
          placeholder={platform === 'booking' ? "Paste URL or Hotel ID (e.g. 5936336)" : `https://www.${platform}.com/...`} // 👈 Updated
          className="w-full text-xs border rounded p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        
        <button 
          onClick={handleConnect}
          disabled={status === 'connecting'}
          className={`w-full py-2 rounded-lg text-xs font-bold text-white transition-all flex justify-center gap-2 ${color}`}
        >
          {status === 'connecting' ? <Loader2 size={14} className="animate-spin"/> : <LinkIcon size={14}/>}
          {status === 'connecting' ? 'Verifying...' : 'Connect Account'}
        </button>
      </div>
    );
  }

  // --- CONNECTED STATE ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden">
       <div className="absolute top-3 left-3 flex items-center gap-2">
         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
         <span className="text-[10px] font-bold text-gray-400">Live</span>
      </div>
      
      <button onClick={handleDisconnect} className="absolute top-3 right-3 text-gray-300 hover:text-red-500">
        <LogOut size={14} />
      </button>

      <div className="mt-2 mb-3 transform scale-125">
         <PlatformIcon source={platform} />
      </div>
      
      <h3 className="font-bold text-gray-800 text-sm">{label} Connected</h3>
      
      {/* ✅ SHOW REAL NAME OR FALLBACK */}
      <p className="text-xs text-gray-400 mb-4 font-medium">
        {accountName || connectedLabel || "Connected Profile"}
      </p>
      
      <button 
        onClick={handleSync}
        disabled={status === 'syncing'}
        className="w-full px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all"
      >
        {status === 'syncing' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        {status === 'syncing' ? 'Syncing...' : 'Sync Reviews'}
      </button>
    </div>
  );
}