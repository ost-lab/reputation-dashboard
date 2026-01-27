"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, Star, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  // 🔄 Auto-Redirect: If user is already logged in, go to Dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Star className="fill-blue-600 w-6 h-6" />
          ReputationAI
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          🚀 New: Google & Facebook Sync Integration
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
          Manage Your Online <br/>
          <span className="text-blue-600">Reputation</span> in One Place
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Aggregate reviews from Google, Facebook, and more. Analyze sentiment with AI and respond faster than ever before.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-transform hover:scale-105"
          >
            Start Free Trial <ArrowRight size={20} />
          </Link>
          <Link 
            href="#" 
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-200 transition-colors"
          >
            View Demo
          </Link>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Instant Sync"
            desc="Connect your Google & Facebook accounts to pull reviews instantly."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-500" />}
            title="AI Analysis"
            desc="Our AI automatically detects positive and negative sentiment in feedback."
          />
          <FeatureCard 
            icon={<Star className="w-8 h-8 text-blue-500" />}
            title="Unified Dashboard"
            desc="See all your ratings, reviews, and SLAs in a single clean view."
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 mt-20 py-12 text-center text-gray-400 text-sm">
        © 2026 ReputationAI Inc. All rights reserved.
      </footer>
    </div>
  );
}

// Simple Sub-component for the grid
function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4 bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}