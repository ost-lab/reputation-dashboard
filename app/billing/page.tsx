"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Check, CreditCard, Zap, Shield, Crown, Loader2 } from 'lucide-react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free'); 

  useEffect(() => {
    const savedPlan = localStorage.getItem('user_plan');
    if (savedPlan) setCurrentPlan(savedPlan);
  }, []);

  // FIX: Added ': string' here
  const handleUpgrade = (planId: string) => {
    setLoading(true);
    
    setTimeout(() => {
      setCurrentPlan(planId);
      localStorage.setItem('user_plan', planId);
      setLoading(false);
      alert(`Successfully upgraded to ${planId.toUpperCase()} Plan!`);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20">
          <div className="mb-8">
             <h1 className="text-2xl font-bold text-gray-800">Billing & Plans</h1>
             <p className="text-gray-500">Manage your subscription and payment methods.</p>
          </div>

          {/* CURRENT PLAN STATUS */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-white shadow-lg mb-10 flex flex-col md:flex-row items-center justify-between">
             <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <CreditCard size={24} className="text-blue-200" />
                </div>
                <div>
                   <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Current Plan</p>
                   <h2 className="text-2xl font-bold capitalize">{currentPlan} Plan</h2>
                </div>
             </div>
             
             <div className="flex gap-4">
                <div className="text-right hidden md:block mr-4">
                   <p className="text-xs text-blue-200">Next Billing Date</p>
                   <p className="font-bold">Oct 24, 2024</p>
                </div>
                {currentPlan === 'free' && (
                  <button className="bg-white text-blue-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                     Manage Payment
                  </button>
                )}
             </div>
          </div>

          {/* PRICING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* FREE PLAN */}
             <div className={`bg-white p-8 rounded-xl border-2 transition-all ${currentPlan === 'free' ? 'border-blue-500 ring-1 ring-blue-500 relative' : 'border-gray-100'}`}>
                {currentPlan === 'free' && (
                   <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">CURRENT</span>
                )}
                <div className="mb-4">
                   <h3 className="font-bold text-gray-500 uppercase text-sm">Starter</h3>
                   <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-gray-800">$0</span>
                      <span className="text-gray-400">/mo</span>
                   </div>
                </div>
                <ul className="space-y-3 mb-8">
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> 3 Social Accounts</li>
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> 50 Reviews / mo</li>
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> Basic Analytics</li>
                </ul>
                <button 
                  disabled={currentPlan === 'free'}
                  className="w-full py-2.5 rounded-lg font-bold text-sm border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {currentPlan === 'free' ? 'Active Plan' : 'Downgrade'}
                </button>
             </div>

             {/* PRO PLAN */}
             <div className={`bg-white p-8 rounded-xl border-2 relative shadow-xl transform scale-105 z-10 ${currentPlan === 'pro' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-purple-100'}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">
                   MOST POPULAR
                </div>
                
                <div className="mb-4 mt-2">
                   <h3 className="font-bold text-purple-600 uppercase text-sm flex items-center gap-2">
                      <Zap size={16} fill="currentColor" /> Pro
                   </h3>
                   <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-gray-800">$49</span>
                      <span className="text-gray-400">/mo</span>
                   </div>
                </div>
                <ul className="space-y-3 mb-8">
                   <li className="flex gap-3 text-sm text-gray-800 font-medium"><Check size={16} className="text-purple-500"/> Unlimited Accounts</li>
                   <li className="flex gap-3 text-sm text-gray-800 font-medium"><Check size={16} className="text-purple-500"/> AI Auto-Replies</li>
                   <li className="flex gap-3 text-sm text-gray-800 font-medium"><Check size={16} className="text-purple-500"/> Website Widgets</li>
                   <li className="flex gap-3 text-sm text-gray-800 font-medium"><Check size={16} className="text-purple-500"/> Competitor Analysis</li>
                </ul>
                <button 
                  onClick={() => handleUpgrade('pro')}
                  disabled={currentPlan === 'pro' || loading}
                  className="w-full py-3 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all flex justify-center items-center gap-2"
                >
                   {loading ? <Loader2 size={16} className="animate-spin"/> : null}
                   {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
             </div>

             {/* ENTERPRISE PLAN */}
             <div className={`bg-white p-8 rounded-xl border-2 transition-all ${currentPlan === 'enterprise' ? 'border-gray-800 ring-1 ring-gray-800 relative' : 'border-gray-100'}`}>
                {currentPlan === 'enterprise' && (
                   <span className="absolute top-0 right-0 bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">CURRENT</span>
                )}
                <div className="mb-4">
                   <h3 className="font-bold text-gray-500 uppercase text-sm flex items-center gap-2">
                      <Shield size={16} /> Enterprise
                   </h3>
                   <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-gray-800">$199</span>
                      <span className="text-gray-400">/mo</span>
                   </div>
                </div>
                <ul className="space-y-3 mb-8">
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> Everything in Pro</li>
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> Dedicated API Access</li>
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> White-label Reports</li>
                   <li className="flex gap-3 text-sm text-gray-600"><Check size={16} className="text-green-500"/> 24/7 Phone Support</li>
                </ul>
                <button 
                   onClick={() => handleUpgrade('enterprise')}
                   disabled={currentPlan === 'enterprise' || loading}
                   className="w-full py-2.5 rounded-lg font-bold text-sm border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                >
                   {currentPlan === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                </button>
             </div>

          </div>
        </main>
      </div>
    </div>
  );
}