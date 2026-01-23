"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Wrapper component to handle search params safely
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      setError("No email found. Please sign up again.");
    }
  }, [email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setMessage("Email verified! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Verify Email</h1>
        <p className="text-sm text-gray-500 mt-2">
          We sent a code to <span className="font-bold">{email}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Verification Code</label>
          <input
            type="text"
            maxLength={6}
            required
            placeholder="123456"
            className="w-full border rounded-lg p-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none mt-1"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} // Only numbers
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Verify Account
        </button>
      </form>
    </div>
  );
}

// Main Page Component
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}