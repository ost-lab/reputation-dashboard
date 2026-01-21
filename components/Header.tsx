"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Bell, Search, User, Building2, LogOut, Settings } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('My Account');
  const [accountType, setAccountType] = useState('business');
  const [isPro, setIsPro] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const type = localStorage.getItem('account_type');
    if (type) setAccountType(type);

    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.businessName) setDisplayName(parsed.businessName);
    }

    const plan = localStorage.getItem('user_plan');
    if (plan === 'pro' || plan === 'enterprise') setIsPro(true);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('auth_token');
      router.push('/login');
    }
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 ml-16 md:ml-20 sticky top-0 z-40">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${accountType === 'business' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
           {accountType === 'business' ? <Building2 size={20} /> : <User size={20} />}
        </div>
        <div>
           <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-gray-800 leading-tight">{displayName}</h2>
              {isPro && (
                <span className="bg-purple-100 text-purple-600 text-[10px] px-1.5 py-0.5 rounded font-bold border border-purple-200">
                  PRO
                </span>
              )}
           </div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
             {accountType === 'business' ? 'Business Account' : 'Personal Brand'}
           </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        
        <div className="relative hidden md:block">
           <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
           <input type="text" placeholder="Search..." className="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>

        <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white cursor-pointer hover:shadow-lg transition-all">
              {displayName.charAt(0)}
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                 <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase">My Account</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{displayName}</p>
                 </div>

                 <div className="p-1">
                    <button 
                      onClick={() => router.push('/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    >
                       <Settings size={16} /> Settings
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                       <LogOut size={16} /> Log Out
                    </button>
                 </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}