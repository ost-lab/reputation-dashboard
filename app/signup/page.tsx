"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 1. Add accountType to state
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 2. Include accountType in the payload
      const payload = { ...form, accountType };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Registration failed");

      // Redirect to login page
      router.push('/login'); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-500">Get started with your free account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* === ACCOUNT TYPE TOGGLE === */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
                accountType === 'personal'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={16} />
              Personal
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
                accountType === 'business'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={16} />
              Business
            </button>
          </div>

          {/* NAME Field */}
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
          
          {/* EMAIL Field */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input 
              type="email" required 
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>

          {/* PASSWORD Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} 
                name="password"
                required
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-black pr-10"
                placeholder="Create a password"
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

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign Up as {accountType === 'personal' ? 'Individual' : 'Business'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 font-bold hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}