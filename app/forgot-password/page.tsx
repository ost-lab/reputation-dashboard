"use client";
import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setMessage('If an account exists with this email, you will receive a reset link shortly.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Link href="/login" className="flex items-center text-sm text-gray-500 mb-6 hover:text-gray-800">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link.</p>

        {message ? (
           <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm mb-4">
             {message}
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input 
                type="email" required 
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
