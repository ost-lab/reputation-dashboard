"use client";
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Loader2, Link as LinkIcon, LogOut } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

// FIX: Define Props
interface ConnectCardProps {
  platform: string;
  label: string;
  color: string;
}

export default function ConnectCard({ platform, label, color }: ConnectCardProps) {
  const storageKey = `${platform}_connected`; 
  
  const [isConnected, setIsConnected] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setIsConnected(true);
      setAccountName(saved);
    } else {
      setIsConnected(false);
      setAccountName('');
      setInputUrl('');
    }
  }, [platform, storageKey]); 

  const handleConnect = () => {
    if (!inputUrl) return alert("Please paste a link first.");
    
    setStatus('connecting');
    setTimeout(() => {
      setIsConnected(true);
      const fakeName = `${label} Page`; 
      setAccountName(fakeName);
      localStorage.setItem(storageKey, fakeName);
      setStatus('idle');
    }, 1200);
  };

  const handleDisconnect = () => {
    if(!confirm("Disconnect this account?")) return;
    localStorage.removeItem(storageKey);
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
        body: JSON.stringify({ platform: platform }) 
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => window.location.reload(), 1500);
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
        <p className="text-xs text-green-600 mt-1">New {label} reviews added.</p>
      </div>
    );
  }

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
          placeholder={`https://www.${platform}.com/...`}
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
      <p className="text-xs text-gray-400 mb-4">{accountName}</p>
      
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