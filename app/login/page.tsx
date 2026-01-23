"use client";
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

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

export default function AuthPage() {
  const router = useRouter();
  
  // UI States
  const [isLogin, setIsLogin] = useState(true);
  const [showVerify, setShowVerify] = useState(false); // Controls the OTP Popup
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Data States
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(""); 
  const [error, setError] = useState('');

  // 1. HANDLE SIGNUP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Success! Move to verification step
      setShowVerify(true); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. HANDLE LOGIN (Step 1: Check Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ We DO NOT call signIn() here anymore. 
      // We call our custom pre-login API to check the password first.
      const res = await fetch('/api/auth/pre-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const data = await res.json();

      if (!res.ok) {
        // If this fails, the password is wrong.
        throw new Error(data.message || "Invalid email or password");
      }

      // ✅ Success: Password is correct. Code sent. Show Popup.
      setShowVerify(true);
      alert(`Verification code sent to ${form.email}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. HANDLE VERIFY (Step 2: Check Code & Create Session)
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✅ call NextAuth with the CODE
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      code: otp, // Sending OTP, NOT password
    });

    if (res?.error) {
      setError("Invalid code. Please try again.");
      setLoading(false);
    } else {
      router.refresh();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <DebugSession />

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md relative">
        
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

        {/* === ERROR MESSAGE === */}
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
            
            {/* NAME Field (Signup Only) */}
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
            )}
            
            {/* EMAIL Field */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input 
                id="email" // ✅ Added for Autofill
                name="email" // ✅ Added for Autofill
                autoComplete="email" // ✅ Added for Autofill
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
                  id="password" // ✅ Added for Autofill
                  name="password" // ✅ Added for Autofill
                  autoComplete="current-password" // ✅ Added for Autofill
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
              {isLogin ? 'Sign In' : 'Sign Up'}
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
                  setError(""); // Clear errors when switching
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