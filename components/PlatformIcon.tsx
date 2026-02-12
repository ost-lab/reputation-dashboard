import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  MessageSquare, 
  BedDouble, 
  MapPin, 
  Star 
} from 'lucide-react';

interface PlatformIconProps {
  source: string;
}

export default function PlatformIcon({ source }: PlatformIconProps) {
  // Handle null/undefined source safely
  const s = source ? source.toLowerCase() : 'manual';

  // --- GOOGLE ---
  if (s.includes('google')) {
    return (
      <div className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm">
        {/* Simple "G" logo style */}
        <span className="font-bold text-blue-600 text-sm">G</span>
      </div>
    );
  }

  // --- BOOKING.COM (New) ---
  if (s.includes('booking')) {
    return (
      <div className="p-1.5 bg-[#003580] rounded-full text-white" title="Booking.com">
        <BedDouble size={14} />
      </div>
    );
  }

  // --- YELP (New) ---
  if (s.includes('yelp')) {
    return (
      <div className="p-1.5 bg-red-600 rounded-full text-white" title="Yelp">
        <Star size={14} fill="currentColor" />
      </div>
    );
  }

  // --- AIRBNB (New) ---
  if (s.includes('airbnb')) {
    return (
      <div className="p-1.5 bg-[#FF5A5F] rounded-full text-white" title="Airbnb">
        <MapPin size={14} />
      </div>
    );
  }

  // --- FACEBOOK ---
  if (s.includes('facebook')) {
    return <div className="p-1.5 bg-blue-600 rounded-full text-white"><Facebook size={14} /></div>;
  }

  // --- INSTAGRAM ---
  if (s.includes('instagram')) {
    return <div className="p-1.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full text-white"><Instagram size={14} /></div>;
  }

  // --- TWITTER / X ---
  if (s.includes('twitter') || s.includes('x')) {
    return <div className="p-1.5 bg-black rounded-full text-white"><Twitter size={14} /></div>;
  }

  // --- LINKEDIN ---
  if (s.includes('linkedin')) {
    return <div className="p-1.5 bg-blue-700 rounded-full text-white"><Linkedin size={14} /></div>;
  }

  // --- YOUTUBE ---
  if (s.includes('youtube')) {
    return <div className="p-1.5 bg-red-600 rounded-full text-white"><Youtube size={14} /></div>;
  }
  
  // --- DEFAULT / MANUAL ---
  return <div className="p-1.5 bg-gray-200 rounded-full text-gray-500"><MessageSquare size={14} /></div>;
}