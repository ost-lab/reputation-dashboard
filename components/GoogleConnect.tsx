"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, RefreshCw, Mail, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GoogleConnect() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // 1. Check Connection & Get Real Business Email
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch('/api/connection-status?platform=google');
        const data = await res.json();
        
        if (data.connected) {
           setIsConnected(true);
           setConnectedEmail(data.email); // Shows the email saved in DB
        }
      } catch (e) {
        console.error("Connection check failed", e);
      }
    }
    
    if (session?.user) {
        checkConnection();
    }
  }, [session]);

  const handleConnect = () => {
    setLoading(true);
    // Use the manual flow that forces the "Choose Account" screen
    window.location.href = "/api/connect/google/start";
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this Google Account?")) return;
    
    setLoading(true);
    try {
        await fetch('/api/connect/google/disconnect', { method: 'DELETE' });
        setIsConnected(false);
        setConnectedEmail(null);
        router.refresh();
    } catch (e) {
        alert("Failed to disconnect");
    } finally {
        setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'google', useToken: true })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.refresh();
        alert(`Sync Complete! Found ${data.count} reviews.`);
      } else {
        alert("Sync failed: " + data.error);
      }
    } catch (error) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // --- RENDER: CONNECTED STATE ---
  if (isConnected) {
    return (
      <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm animate-in fade-in relative">
        {/* ❌ DISCONNECT BUTTON */}
        <button 
            onClick={handleDisconnect}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            title="Disconnect Account"
        >
            <Trash2 size={18} />
        </button>

        <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
               <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-lg">Google Connected</h3>
                {/* ✅ DISPLAY BUSINESS EMAIL FROM DB */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail size={14} />
                    <span>{connectedEmail || "Loading..."}</span>
                </div>
            </div>
        </div>

        <button 
            onClick={handleSync}
            disabled={syncing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
        >
            {syncing ? (
                <>
                    <Loader2 className="animate-spin" size={18} />
                    Syncing...
                </>
            ) : (
                <>
                    <RefreshCw size={18} />
                    Sync Reviews Now
                </>
            )}
        </button>
      </div>
    );
  }

  // --- RENDER: DISCONNECTED STATE ---
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </div>
      
      <h3 className="font-bold text-gray-900">Connect Google Business</h3>
      <p className="text-sm text-gray-500 mt-2 mb-4">
        Grant access to fetch reviews and manage replies.
      </p>

      <button 
        onClick={handleConnect}
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Connect Account"}
      </button>
    </div>
  );
}