"use client";
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft, User, Building2, Check } from 'lucide-react';

// Debug Component
function DebugSession() {
  const { data: session, status } = useSession();
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 text-xs rounded opacity-90 z-50 pointer-events-none">
      <p className="font-bold mb-1">AUTH DEBUGGER:</p>
      <p>Status: <span className={status === 'authenticated' ? 'text-green-400' : 'text-red-400'}>{status}</span></p>
      <p>User: {session?.user?.email || "None"}</p>
    </div>
  );
}

// ✅ DEFINING PLATFORMS PER INDUSTRY
const PLATFORM_MAPPING: Record<string, string[]> = {
  "Restaurant":   ['Google', 'Yelp', 'TripAdvisor', 'Facebook', 'OpenTable'],
  "Retail":       ['Google', 'Facebook', 'Instagram', 'Yelp', 'Amazon'],
  "Service":      ['Google', 'Yelp', 'Facebook', 'LinkedIn', 'Angi'],
  "Hotel":        ['Google', 'TripAdvisor', 'Booking.com', 'Expedia', 'Facebook'],
  "Healthcare":   ['Google', 'Healthgrades', 'Vitals', 'Facebook', 'Zocdoc'],
  "Tech":         ['G2', 'Capterra', 'LinkedIn', 'Google', 'Trustpilot'],
  "RealEstate":   ['Google', 'Zillow', 'Realtor.com', 'Facebook', 'LinkedIn'],
  "Automotive":   ['Google', 'Yelp', 'Cars.com', 'Facebook', 'Edmunds'],
  "Education":    ['Google', 'Facebook', 'GreatSchools', 'LinkedIn'],
  "Entertainment":['Google', 'Yelp', 'TripAdvisor', 'Facebook', 'Ticketmaster'],
  "Beauty":       ['Google', 'Yelp', 'Facebook', 'Instagram', 'Fresha'],
  "Finance":      ['Google', 'LinkedIn', 'Facebook', 'Yelp', 'BBB'],
  "Construction": ['Google', 'Angi', 'Houzz', 'Facebook', 'Yelp'],
  "Other":        ['Google', 'Yelp', 'Facebook', 'LinkedIn', 'Trustpilot']
};

export default function AuthPage() {
  const router = useRouter();
  
  // UI States
  const [isLogin, setIsLogin] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Data States
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(""); 
  const [error, setError] = useState('');

  // === NEW STATES FOR BUSINESS ===
  const [businessType, setBusinessType] = useState("Restaurant");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // ✅ Auto-select relevant platforms when changing business type (Optional UX improvement)
  // When business type changes, we reset the selection so the user starts fresh with relevant options.
  useEffect(() => {
    setSelectedPlatforms([]);
  }, [businessType]);

  // Toggle Logic for Platforms
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  // 1. HANDLE SIGNUP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { 
        ...form, 
        accountType,
        businessType: accountType === 'business' ? businessType : undefined,
        platforms: accountType === 'business' ? selectedPlatforms : undefined,
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setShowVerify(true); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. HANDLE LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/pre-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      setShowVerify(true);
      alert(`Verification code sent to ${form.email}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. HANDLE VERIFY
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      code: otp,
    });

    if (res?.error) {
      setError("Invalid code. Please try again.");
      setLoading(false);
    } else {
      router.refresh();
      router.push('/');
    }
  };

  // Helper to get current options based on selection
  const currentPlatformOptions = PLATFORM_MAPPING[businessType] || PLATFORM_MAPPING['Other'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <DebugSession />

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md relative my-10">
        
        {/* === HEADER === */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {showVerify ? 'Verify Identity' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {showVerify 
              ? `Enter the code sent to ${form.email}` 
              : (isLogin ? 'Enter your details to sign in' : 'Get started with your free account')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* ========================== */}
        {/* === VIEW 1: VERIFY OTP === */}
        {/* ========================== */}
        {showVerify ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input 
                type="text" 
                maxLength={6}
                required 
                className="w-full border rounded-lg p-3 text-center text-2xl tracking-[10px] font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => { setShowVerify(false); setError(""); }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 flex items-center justify-center gap-1 mt-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </form>
        ) : (
          
        /* ================================== */
        /* === VIEW 2: LOGIN / REGISTER === */
        /* ================================== */
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            
            {/* === ACCOUNT TYPE TOGGLE (Signup Only) === */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-2">
                <button
                  type="button"
                  onClick={() => setAccountType('personal')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                    accountType === 'personal'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User size={14} />
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('business')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                    accountType === 'business'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Building2 size={14} />
                  Business
                </button>
              </div>
            )}

            {/* NAME Field */}
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  {accountType === 'personal' ? 'Full Name' : 'Company Name'}
                </label>
                <input 
                  type="text" required 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={accountType === 'personal' ? "John Doe" : "Acme Corp"}
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
            )}

            {/* === BUSINESS FIELDS (Only show if Business Selected) === */}
            {!isLogin && accountType === 'business' && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                
                {/* Business Type Dropdown */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Business Type</label>
                  <select 
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    {/* Render options from the keys of our mapping */}
                    {Object.keys(PLATFORM_MAPPING).map((type) => (
                      <option key={type} value={type}>
                        {/* Add spaces nicely: "RealEstate" -> "Real Estate" */}
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Platform Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Connect Platforms for {businessType.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentPlatformOptions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`text-xs py-2 px-3 rounded border flex items-center justify-between transition-all ${
                          selectedPlatforms.includes(p)
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                        {selectedPlatforms.includes(p) && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* EMAIL Field */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input 
                id="email" 
                name="email"
                autoComplete="email"
                type="email" required 
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>

            {/* PASSWORD Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-black pr-10"
                  placeholder="Enter your password"
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? 'Sign In' : (accountType === 'business' ? 'Sign Up as Business' : 'Sign Up as Individual')}
            </button>
            
            {isLogin && (
              <div className="flex justify-end mt-1">
                <a href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
            )}
          </form>
        )}

        {/* === FOOTER: SOCIALS & TOGGLE === */}
        {!showVerify && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(""); 
                }} 
                className="text-blue-600 font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}