"use client";

import { useState, useEffect } from 'react'; 
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react'; // 1. Import Icons

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams(); 
  const token = typeof params?.token === 'string' ? params.token : "";

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2. Add State for visibility
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
        setError("Missing token. Please check your email link.");
        setLoading(false);
        return;
    }
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successfully! Redirecting to login...");
        router.push('/login'); 
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Set New Password</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            
            {/* 3. Wrap input in relative div */}
            <div className="relative">
              <input 
                // 4. Toggle type based on state
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-black pr-10" // Added pr-10 for space
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              
              {/* 5. Add the Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}