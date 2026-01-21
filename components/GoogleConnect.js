// "use client";
// import { signIn, signOut, useSession } from "next-auth/react";
// import { useState } from "react";
// import { RefreshCw, CheckCircle, Loader2 } from 'lucide-react';// Import a sync icon

// export default function GoogleConnect() {
//   const { data: session } = useSession();
//   const [syncing, setSyncing] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleSync = async () => {
//     setSyncing(true);
//     setMessage("Connecting to Google...");
    
//     try {
//       const res = await fetch('/api/google/sync', { method: 'POST' });
//       const data = await res.json();
      
//       if (res.ok) {
//         setMessage(data.message);
//         // Reload page after 2 seconds to see new reviews
//         setTimeout(() => window.location.reload(), 2000);
//       } else {
//         setMessage(`Error: ${data.error}`);
//       }
//     } catch (error) {
//       setMessage("Failed to sync.");
//     } finally {
//       setSyncing(false);
//     }
//   };

//   if (session) {
//     return (
//       <div className="flex flex-col gap-2 bg-white p-4 rounded-lg border shadow-sm">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <p className="text-sm font-medium text-gray-700">
//               {session.user.email}
//             </p>
//           </div>
//           <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline">
//             Disconnect
//           </button>
//         </div>

//         {/* The Sync Button */}
//         <button 
//           onClick={handleSync}
//           disabled={syncing}
//           className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-md hover:bg-blue-100 transition text-sm font-medium disabled:opacity-50"
//         >
//           <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
//           {syncing ? "Syncing Reviews..." : "Sync Google Reviews"}
//         </button>
        
//         {message && <p className="text-xs text-center text-gray-500 mt-1">{message}</p>}
//       </div>
//     );
//   }

//   return (
//     <button
//       onClick={() => signIn("google")}
//       className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
//     >
//       <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
//       Connect Google Business
//     </button>
//   );
// }



"use client";
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Loader2, Link as LinkIcon, LogOut } from 'lucide-react';

export default function GoogleConnect() {
  // We use localStorage to 'remember' if the user is connected (Simulating a real database connection)
  const [isConnected, setIsConnected] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle, connecting, syncing, success

  // Check on load if already connected
  useEffect(() => {
    const saved = localStorage.getItem('google_connected');
    if (saved) {
      setIsConnected(true);
      setBusinessName(saved);
    }
  }, []);

  // 1. HANDLE CONNECTION (The "Paste Link" Step)
  const handleConnect = () => {
    if (!inputUrl.includes('google')) {
      alert("Please paste a valid Google Maps link");
      return;
    }
    
    setStatus('connecting');
    
    // Simulate verifying the link...
    setTimeout(() => {
      setIsConnected(true);
      setBusinessName("My Business (via Maps)");
      localStorage.setItem('google_connected', "My Business (via Maps)");
      setStatus('idle');
    }, 1500);
  };

  // 2. HANDLE DISCONNECT
  const handleDisconnect = () => {
    setIsConnected(false);
    setBusinessName('');
    setInputUrl('');
    localStorage.removeItem('google_connected');
  };

  // 3. HANDLE SYNC (The logic we built before)
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

  // --- VIEW 1: NOT CONNECTED (Show Input Field) ---
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

  // --- VIEW 2: SUCCESS STATE (Just after sync) ---
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

  // --- VIEW 3: CONNECTED & READY (Show Sync Button) ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group">
      
      {/* Green Dot & Disconnect Button */}
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