"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Utensils, Stethoscope, Gavel, Home, ArrowRight, CheckCircle, Store, User } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  
  // FIX: Explicitly tell TypeScript this can be a number
  const [step, setStep] = useState<number>(-1); 
  const [loading, setLoading] = useState(false);
  
  // FIX: Explicitly tell TypeScript this can be a string OR null
  const [accountType, setAccountType] = useState<string | null>(null); 
  const [businessName, setBusinessName] = useState('');
  
  // Form State
  const [industry, setIndustry] = useState('');
  const [keywords, setKeywords] = useState('');

  // 1. Check Logic on Mount
  useEffect(() => {
    // Load Name
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      setBusinessName(JSON.parse(settings).businessName);
    }

    // CHECK: Do we know the Account Type?
    const type = localStorage.getItem('account_type');
    
    if (!type) {
      // CASE A: Google Signup (Type is missing) -> Go to Step 0 (Ask Type)
      setStep(0);
    } else {
      // CASE B: Email Signup (Type is known) -> Go to standard flow
      setAccountType(type);
      if (type === 'personal') setStep(2); // Skip Industry
      else setStep(1); // Go to Industry
    }
  }, []);

  // FIX: Add type 'string' to parameter
  const handleSelectType = (type: string) => {
    setAccountType(type);
    localStorage.setItem('account_type', type);
    
    // Auto-advance
    if (type === 'personal') setStep(2); // Skip Industry
    else setStep(1); // Go to Industry
  };

  // 3. Handle Finish
  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      const currentSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
      
      const newSettings = {
        ...currentSettings,
        industry: industry, 
        aiKeywords: keywords
      };

      localStorage.setItem('app_settings', JSON.stringify(newSettings));
      router.push('/');
    }, 1500);
  };

  const INDUSTRIES = [
    { id: 'food', label: 'Restaurant / Bar', icon: <Utensils size={24}/> },
    { id: 'health', label: 'Healthcare / Dental', icon: <Stethoscope size={24}/> },
    { id: 'realestate', label: 'Real Estate', icon: <Home size={24}/> },
    { id: 'retail', label: 'Retail / E-com', icon: <Store size={24}/> },
    { id: 'legal', label: 'Legal / Services', icon: <Gavel size={24}/> },
    { id: 'other', label: 'Other', icon: <Building2 size={24}/> },
  ];

  if (step === -1) return null; // Prevent flash

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        
        {/* PROGRESS BAR */}
        <div className="bg-gray-100 h-2 w-full">
          <div 
            className="bg-blue-600 h-full transition-all duration-500" 
            style={{ 
              width: step === 0 ? '10%' : step === 1 ? '50%' : '100%' 
            }}
          ></div>
        </div>

        <div className="p-10 flex-1 flex flex-col">

          {/* --- STEP 0: SELECT ACCOUNT TYPE (Only for Google Signups) --- */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {businessName}! 👋</h1>
               <p className="text-gray-500 mb-8">First, tell us how you plan to use this platform.</p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BUSINESS OPTION */}
                  <button 
                    onClick={() => handleSelectType('business')}
                    className="p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center text-center group"
                  >
                     <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Building2 size={32} />
                     </div>
                     <h3 className="font-bold text-gray-800 text-lg">Business</h3>
                     <p className="text-sm text-gray-500 mt-2">I manage a restaurant, store, clinic, or agency.</p>
                  </button>

                  {/* PERSONAL OPTION */}
                  <button 
                    onClick={() => handleSelectType('personal')}
                    className="p-8 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center text-center group"
                  >
                     <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <User size={32} />
                     </div>
                     <h3 className="font-bold text-gray-800 text-lg">Personal Brand</h3>
                     <p className="text-sm text-gray-500 mt-2">I am an influencer, freelancer, or public figure.</p>
                  </button>
               </div>
            </div>
          )}
          
          {/* --- STEP 1: INDUSTRY SELECTION (Business Only) --- */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Select Industry 🏢</h1>
              <p className="text-gray-500 mb-8">To customize your dashboard, tell us what industry you are in.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={`
                      p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md
                      ${industry === ind.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'
                      }
                    `}
                  >
                    {ind.icon}
                    <span className="font-bold text-sm">{ind.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-auto">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!industry}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next Step <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 2: AI TUNING (Everyone) --- */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Train your AI 🧠</h1>
              <p className="text-gray-500 mb-6">Give us 3 keywords that describe your {accountType === 'personal' ? 'personal brand' : 'brand'} voice.</p>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                 <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Your Brand Keywords</label>
                 <input 
                   type="text" 
                   autoFocus
                   placeholder="e.g. Professional, Witty, Direct..."
                   className="w-full bg-white border border-blue-200 rounded-lg p-4 text-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-300"
                   value={keywords}
                   onChange={(e) => setKeywords(e.target.value)}
                 />
                 <p className="text-xs text-blue-400 mt-2">We use this to generate auto-replies that sound like you.</p>
              </div>

              <div className="mt-auto flex justify-between items-center">
                
                {/* Back Button Logic */}
                <button 
                    onClick={() => {
                        if (accountType === 'personal') setStep(0);
                        else setStep(1);
                    }}
                    className="text-gray-400 font-bold text-sm hover:text-gray-600"
                >
                    Back
                </button>

                <button 
                  onClick={handleFinish}
                  disabled={!keywords || loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all"
                >
                  {loading ? 'Setting up Dashboard...' : 'Finish Setup'} 
                  {!loading && <CheckCircle size={18} />}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}