"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 1. STANDARD LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email && password.length >= 6) {
        localStorage.setItem('auth_token', 'demo-token-123');
        localStorage.setItem('user_email', email);
        localStorage.setItem('account_type', 'business'); // Default for email login
        router.push('/');
      } else {
        setError('Invalid credentials. (Try password: password123)');
        setLoading(false);
      }
    }, 1500);
  };

  // 2. GOOGLE LOGIN SIMULATION
  // ... inside SignupPage component

  const handleGoogleLogin = () => {
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
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
             <span className="text-3xl font-bold text-white">RM</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-blue-100 text-sm">Sign in to manage your reputation.</p>
        </div>

        <div className="p-8">
          
          {/* --- GOOGLE BUTTON --- */}
          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all mb-6 group"
          >
            {googleLoading ? (
               <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : (
               <>
                 {/* Google SVG Icon */}
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                 </svg>
                 <span>Sign in with Google</span>
               </>
            )}
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or continue with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* --- EXISTING EMAIL FORM --- */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded text-center">{error}</div>}

            <button 
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Don't have an account? <a href="/signup" className="text-blue-600 font-bold hover:underline">Start Free Trial</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}