import { Facebook, Instagram, Twitter, Linkedin, Youtube, MessageSquare } from 'lucide-react';

export default function PlatformIcon({ source }) {
  // Convert source to lowercase to avoid case-sensitive errors
  const s = source ? source.toLowerCase() : 'manual';

  // --- 1. GOOGLE ICON (Custom "G") ---
  if (s.includes('google')) {
    return (
      <div className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="font-bold text-blue-500 text-sm">G</span>
      </div>
    );
  }

  // --- 2. FACEBOOK ---
  if (s.includes('facebook')) {
    return <div className="p-1.5 bg-blue-600 rounded-full text-white"><Facebook size={14} /></div>;
  }

  // --- 3. INSTAGRAM ---
  if (s.includes('instagram')) {
    return <div className="p-1.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full text-white"><Instagram size={14} /></div>;
  }

  // --- 4. TWITTER / X ---
  if (s.includes('twitter') || s.includes('x')) {
    return <div className="p-1.5 bg-black rounded-full text-white"><Twitter size={14} /></div>;
  }

  // --- 5. LINKEDIN ---
  if (s.includes('linkedin')) {
    return <div className="p-1.5 bg-blue-700 rounded-full text-white"><Linkedin size={14} /></div>;
  }

  // --- 6. YOUTUBE ---
  if (s.includes('youtube')) {
    return <div className="p-1.5 bg-red-600 rounded-full text-white"><Youtube size={14} /></div>;
  }
  
  // --- DEFAULT / MANUAL ---
  return <div className="p-1.5 bg-gray-200 rounded-full text-gray-500"><MessageSquare size={14} /></div>;
}