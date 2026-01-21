"use client";
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Loader2, Link as LinkIcon, LogOut } from 'lucide-react';

export default function GoogleConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  
  const [status, setStatus] = useState('idle'); 

  useEffect(() => {
    const saved = localStorage.getItem('google_connected');
    if (saved) {
      setIsConnected(true);
      setBusinessName(saved);
    }
  }, []);

  const handleConnect = () => {
    if (!inputUrl.includes('google')) {
      alert("Please paste a valid Google Maps link");
      return;
    }
    
    setStatus('connecting');
    
    setTimeout(() => {
      setIsConnected(true);
      setBusinessName("My Business (via Maps)");
      localStorage.setItem('google_connected', "My Business (via Maps)");
      setStatus('idle');
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setBusinessName('');
    setInputUrl('');
    localStorage.removeItem('google_connected');
  };

  const handleSync = async () => {
    setStatus('syncing');

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'google' })
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
            window.location.reload(); 
        }, 1500);
      }
    } catch (error) {
      console.error("Sync failed", error);
      setStatus('idle');
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-auto flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white border rounded-full flex items-center justify-center shadow-sm">
             <span className="font-bold text-blue-500 text-lg">G</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Connect Google Business</h3>
            <p className="text-xs text-gray-500">To fetch reviews automatically</p>
          </div>
        </div>

        <div className="mt-2">
           <input 
             type="text" 
             placeholder="Paste Google Maps Link here..."
             className="w-full text-xs border rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
             value={inputUrl}
             onChange={(e) => setInputUrl(e.target.value)}
           />
           <button 
             onClick={handleConnect}
             disabled={status === 'connecting'}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all flex justify-center gap-2"
           >
             {status === 'connecting' ? <Loader2 size={14} className="animate-spin"/> : <LinkIcon size={14}/>}
             {status === 'connecting' ? 'Verifying...' : 'Connect Business'}
           </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200 flex flex-col items-center justify-center text-center h-48">
        <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3 animate-bounce">
          <CheckCircle size={24} />
        </div>
        <h3 className="font-bold text-green-800 text-sm">Sync Complete!</h3>
        <p className="text-xs text-green-600 mt-1">New reviews added to dashboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group">
      
      <div className="absolute top-3 left-3 flex items-center gap-2">
         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
         <span className="text-[10px] font-bold text-gray-400">Connected</span>
      </div>
      
      <button 
        onClick={handleDisconnect}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
        title="Disconnect"
      >
        <LogOut size={14} />
      </button>

      <div className="mt-4">
        <div className="w-12 h-12 bg-white border rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
             <span className="font-bold text-blue-500 text-xl">G</span>
        </div>
        <h3 className="font-bold text-gray-800 text-sm">Google Reviews</h3>
        <p className="text-xs text-gray-400 mb-4">Account: {businessName}</p>
        
        <button 
          onClick={handleSync}
          disabled={status === 'syncing'}
          className={`
            w-full px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all
            ${status === 'syncing' 
              ? 'bg-gray-100 text-gray-400 cursor-wait' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }
          `}
        >
          {status === 'syncing' ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw size={16} /> 
              Sync Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}