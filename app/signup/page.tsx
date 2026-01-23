"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountType, setAccountType] = useState('business');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // 1. STANDARD SIGNUP
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('auth_token', 'demo-token-new');
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('account_type', accountType); 
      
      const settings = {
        businessName: formData.name, 
        aiTone: accountType === 'business' ? 'professional' : 'casual'
      };
      localStorage.setItem('app_settings', JSON.stringify(settings));

     router.push('/onboarding'); // New way
    }, 1500);
  };

  // 2. GOOGLE SIGNUP SIMULATION
  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setTimeout(() => {
        // 1. Simulate Auth Token
        localStorage.setItem('auth_token', 'google-token-new');
        localStorage.setItem('user_email', 'alex@gmail.com');
        
        // 2. IMPORTANT: REMOVE any pre-set account type. 
        // We want the Onboarding page to detect this is missing and ASK the user.
        localStorage.removeItem('account_type'); 
        
        // 3. Set a temporary name (User can change this in settings later)
        const settings = {
          businessName: "Alex (Google)",
          aiTone: "casual",
          googleConnected: true
        };
        localStorage.setItem('app_settings', JSON.stringify(settings));

        // 4. Send to Onboarding
        router.push('/onboarding');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-100 text-sm">Start managing your reputation today.</p>
        </div>

        <div className="p-8">

          {/* --- GOOGLE BUTTON --- */}
          <button 
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all mb-6"
          >
            {googleLoading ? (
               <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : (
               <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                 </svg>
                 <span>Sign up with Google</span>
               </>
            )}
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or use email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          {/* --- ACCOUNT TYPE SELECTOR --- */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${accountType === 'business' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Building2 size={16} /> Business
            </button>
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${accountType === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={16} /> Personal
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                {accountType === 'business' ? 'Business Name' : 'Full Name'}
              </label>
              <div className="relative">
                {accountType === 'business' ? <Building2 className="absolute left-3 top-3 text-gray-400" size={18} /> : <User className="absolute left-3 top-3 text-gray-400" size={18} />}
                <input 
                  type="text" 
                  required
                  placeholder={accountType === 'business' ? "e.g. Joe's Pizza" : "e.g. John Doe"}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password} // Adjust 'data.password' to match your state
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    required
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-black pr-10"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input type={showConfirm ? "text" : "password"} />
                <button onClick={() => setShowConfirm(!showConfirm)} >
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>

            <button 
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t text-xs text-gray-500">
           Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Log In</a>
        </div>

      </div>
    </div>
  );
}