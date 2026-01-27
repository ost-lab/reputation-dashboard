"use client";
import { useState, useEffect } from 'react';
import { Copy, Check, Eye, EyeOff, Webhook } from 'lucide-react';

export default function WebhookConnect() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // The URL your API listens on (Update with your real domain in production)
  // In dev it is http://localhost:3000/api/webhooks/incoming
  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/incoming` 
    : '/api/webhooks/incoming';

  useEffect(() => {
    // Fetch the user's existing API key or generate one
    async function fetchKey() {
      try {
        const res = await fetch('/api/user/api-key'); 
        if (res.ok) {
          const data = await res.json();
          setApiKey(data.apiKey);
        }
      } catch (err) {
        console.error("Failed to fetch API key");
      } finally {
        setLoading(false);
      }
    }
    fetchKey();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNew = async () => {
    if(!confirm("Regenerating a key will stop existing integrations. Continue?")) return;
    setLoading(true);
    // Call API to generate new key (implementation below)
    const res = await fetch('/api/user/api-key', { method: 'POST' });
    const data = await res.json();
    setApiKey(data.apiKey);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <Webhook size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Zapier / Webhook Integration</h3>
          <p className="text-sm text-gray-500">Push data from 5,000+ apps directly to your dashboard.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* WEBHOOK URL DISPLAY */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">1. Your Webhook URL</label>
          <div className="flex gap-2 mt-1">
            <code className="flex-1 bg-gray-50 border p-3 rounded text-sm text-gray-600 font-mono truncate">
              {webhookUrl}
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText(webhookUrl)}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border"
              title="Copy URL"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* API KEY DISPLAY */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">2. Your API Key</label>
          <div className="flex gap-2 mt-1 relative">
            <input 
              type={showKey ? "text" : "password"}
              value={apiKey}
              readOnly
              className="flex-1 bg-gray-50 border p-3 rounded text-sm text-gray-800 font-mono focus:outline-none"
              placeholder={loading ? "Loading..." : "No API Key generated"}
            />
            
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <button 
              onClick={handleCopy}
              className={`p-3 rounded border transition-all w-12 flex items-center justify-center ${
                copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Copy Key"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Keep this key secret. <button onClick={handleGenerateNew} className="text-blue-600 hover:underline">Generate new key</button>
          </p>
        </div>
      </div>
    </div>
  );
}