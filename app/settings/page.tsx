"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Save, Store, User, Bot, Bell, CheckCircle } from 'lucide-react'; // <--- Added User Icon

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accountType, setAccountType] = useState('business'); // Default to business

  // Form State
  const [settings, setSettings] = useState({
    businessName: "My Business",
    website: "",
    aiTone: "professional", 
    autoReply: false,
    emailAlerts: true
  });

  // 1. Load Settings & Account Type on Mount
  useEffect(() => {
    // A. Check Account Type
    const type = localStorage.getItem('account_type');
    if (type) setAccountType(type);

    // B. Load Saved Preferences
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // 2. Handle Save
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20 max-w-4xl">
          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

          {/* SECTION 1: PROFILE (Dynamic based on Account Type) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
             <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className={`p-2 rounded-lg ${accountType === 'business' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                   {/* Swap Icon based on Type */}
                   {accountType === 'business' ? <Store size={20} /> : <User size={20} />}
                </div>
                <div>
                   {/* Dynamic Header */}
                   <h2 className="font-bold text-gray-800">
                      {accountType === 'business' ? 'Business Profile' : 'Personal Profile'}
                   </h2>
                   <p className="text-xs text-gray-500">
                      {accountType === 'business' ? 'How your business appears on the dashboard' : 'Manage your personal brand details'}
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   {/* Dynamic Label */}
                   <label className="block text-xs font-bold text-gray-500 mb-1">
                      {accountType === 'business' ? 'Business Name' : 'Full Name'}
                   </label>
                   <input 
                     type="text" 
                     className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     // Ensure fallback to empty string to prevent "uncontrolled" error
                     value={settings.businessName || ''}
                     onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">
                      {accountType === 'business' ? 'Website URL' : 'Portfolio / Website'}
                   </label>
                   <input 
                     type="text" 
                     className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder={accountType === 'business' ? "https://example.com" : "https://linkedin.com/in/me"}
                     value={settings.website || ''}
                     onChange={(e) => setSettings({...settings, website: e.target.value})}
                   />
                </div>
             </div>
          </div>

          {/* SECTION 2: AI PREFERENCES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
             <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                   <Bot size={20} />
                </div>
                <div>
                   <h2 className="font-bold text-gray-800">AI Personalization</h2>
                   <p className="text-xs text-gray-500">Adjust how the AI writes replies</p>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-2">Reply Tone</label>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['Professional', 'Casual', 'Enthusiastic'].map((tone) => (
                        <button
                           key={tone}
                           onClick={() => setSettings({...settings, aiTone: tone.toLowerCase()})}
                           className={`
                             p-3 rounded-lg border text-sm font-medium transition-all text-left
                             ${settings.aiTone === tone.toLowerCase() 
                               ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500' 
                               : 'border-gray-200 hover:border-gray-300'
                             }
                           `}
                        >
                           {tone}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                   <div>
                      <span className="block text-sm font-bold text-gray-800">Auto-Draft Replies</span>
                      <span className="text-xs text-gray-500">Automatically generate AI drafts for new reviews</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.autoReply}
                        onChange={(e) => setSettings({...settings, autoReply: e.target.checked})} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                   </label>
                </div>
             </div>
          </div>

          {/* SECTION 3: NOTIFICATIONS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
             <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                   <Bell size={20} />
                </div>
                <div>
                   <h2 className="font-bold text-gray-800">Notifications</h2>
                   <p className="text-xs text-gray-500">Manage your alert preferences</p>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email me about negative reviews (1-2 Stars)</span>
                <input 
                  type="checkbox" 
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                />
             </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
             <button 
               onClick={handleSave}
               disabled={loading}
               className={`
                 px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all
                 ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
               `}
             >
               {loading ? 'Saving...' : success ? 'Changes Saved!' : 'Save Settings'}
               {success ? <CheckCircle size={20} /> : <Save size={20} />}
             </button>
          </div>

        </main>
      </div>
    </div>
  );
}