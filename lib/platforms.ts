import { 
  // Essentials
  MapPin, Facebook, Instagram, Star, Globe, ShieldCheck, BookOpen, 
  
  // Social
  Twitter, Linkedin, Video, MessageCircle, Heart, 
  
  // Automotive
  Car, Wrench, Gauge, FileText, // ✅ FIX: Added FileText here
  
  // Healthcare
  Stethoscope, HeartPulse, Activity, UserPlus, 
  
  // Real Estate
  Home, Building, Key, 
  
  // Travel & Hospitality
  Plane, Utensils, BedDouble, Coffee, 
  
  // Home Services
  Hammer, Ruler, HardHat, 
  
  // Legal & Financial
  Scale, Gavel, DollarSign, 
  
  // Software
  Monitor, Code, Database, Search
} from 'lucide-react';

export const MASTER_PLATFORMS = [
  // --- 1. ESSENTIALS ---
  { id: 'google', label: 'Google', category: 'General', color: 'text-blue-500', icon: MapPin },
  { id: 'facebook', label: 'Facebook', category: 'General', color: 'text-blue-600', icon: Facebook },
  { id: 'instagram', label: 'Instagram', category: 'Social', color: 'text-pink-600', icon: Instagram },
  { id: 'yelp', label: 'Yelp', category: 'General', color: 'text-red-500', icon: Star },
  { id: 'bbb', label: 'BBB', category: 'General', color: 'text-blue-800', icon: ShieldCheck },
  { id: 'trustpilot', label: 'Trustpilot', category: 'General', color: 'text-green-500', icon: Star },
  { id: 'yellowpages', label: 'Yellow Pages', category: 'Directories', color: 'text-yellow-600', icon: BookOpen },

  // --- 2. SOCIAL & COMMUNICATION ---
  { id: 'twitter', label: 'Twitter / X', category: 'Social', color: 'text-black', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', category: 'Social', color: 'text-blue-700', icon: Linkedin },
  { id: 'tiktok', label: 'TikTok', category: 'Social', color: 'text-black', icon: Video },
  { id: 'youtube', label: 'YouTube', category: 'Social', color: 'text-red-600', icon: Video },
  { id: 'whatsapp', label: 'WhatsApp', category: 'Chat', color: 'text-green-500', icon: MessageCircle },
  { id: 'pinterest', label: 'Pinterest', category: 'Social', color: 'text-red-600', icon: Heart },

  // --- 3. AUTOMOTIVE ---
  { id: 'carsdotcom', label: 'Cars.com', category: 'Automotive', color: 'text-purple-600', icon: Car },
  { id: 'dealerrater', label: 'DealerRater', category: 'Automotive', color: 'text-blue-500', icon: Star },
  { id: 'edmunds', label: 'Edmunds', category: 'Automotive', color: 'text-blue-400', icon: Gauge },
  
  // ✅ FIX: Changed 'icon: File' to 'icon: FileText'
  { id: 'carfax', label: 'Carfax', category: 'Automotive', color: 'text-gray-700', icon: FileText },
  
  { id: 'cargurus', label: 'CarGurus', category: 'Automotive', color: 'text-red-500', icon: Search },
  { id: 'autotrader', label: 'Autotrader', category: 'Automotive', color: 'text-orange-600', icon: Car },

  // --- 4. HEALTHCARE ---
  { id: 'healthgrades', label: 'Healthgrades', category: 'Healthcare', color: 'text-blue-500', icon: Activity },
  { id: 'vitals', label: 'Vitals', category: 'Healthcare', color: 'text-teal-500', icon: HeartPulse },
  { id: 'zocdoc', label: 'ZocDoc', category: 'Healthcare', color: 'text-yellow-500', icon: Stethoscope },
  { id: 'ratemds', label: 'RateMDs', category: 'Healthcare', color: 'text-blue-400', icon: UserPlus },
  { id: 'realself', label: 'RealSelf', category: 'Healthcare', color: 'text-pink-500', icon: Heart },
  { id: 'careswitch', label: 'Caring.com', category: 'Senior Care', color: 'text-purple-500', icon: Heart },

  // --- 5. REAL ESTATE ---
  { id: 'zillow', label: 'Zillow', category: 'Real Estate', color: 'text-blue-600', icon: Home },
  { id: 'realtor', label: 'Realtor.com', category: 'Real Estate', color: 'text-red-600', icon: Home },
  { id: 'trulia', label: 'Trulia', category: 'Real Estate', color: 'text-green-600', icon: MapPin },
  { id: 'apartments', label: 'Apartments.com', category: 'Real Estate', color: 'text-gray-800', icon: Building },
  { id: 'redfin', label: 'Redfin', category: 'Real Estate', color: 'text-red-500', icon: Home },

  // --- 6. HOSPITALITY & TRAVEL ---
  { id: 'tripadvisor', label: 'TripAdvisor', category: 'Travel', color: 'text-green-600', icon: Plane },
  { id: 'opentable', label: 'OpenTable', category: 'Dining', color: 'text-red-600', icon: Utensils },
  { id: 'expedia', label: 'Expedia', category: 'Travel', color: 'text-yellow-500', icon: Plane },
  { id: 'booking', label: 'Booking.com', category: 'Travel', color: 'text-blue-600', icon: BedDouble },
  { id: 'airbnb', label: 'Airbnb', category: 'Travel', color: 'text-red-500', icon: Home },
  { id: 'hotels', label: 'Hotels.com', category: 'Travel', color: 'text-red-700', icon: BedDouble },
  { id: 'doordash', label: 'DoorDash', category: 'Dining', color: 'text-red-600', icon: Utensils },

  // --- 7. HOME SERVICES ---
  { id: 'angi', label: 'Angi (HomeAdvisor)', category: 'Services', color: 'text-green-500', icon: Hammer },
  { id: 'thumbtack', label: 'Thumbtack', category: 'Services', color: 'text-blue-400', icon: Wrench },
  { id: 'houzz', label: 'Houzz', category: 'Services', color: 'text-green-600', icon: Home },
  { id: 'porch', label: 'Porch', category: 'Services', color: 'text-blue-500', icon: HardHat },
  { id: 'bark', label: 'Bark', category: 'Services', color: 'text-indigo-600', icon: Search },

  // --- 8. LEGAL & FINANCIAL ---
  { id: 'avvo', label: 'Avvo', category: 'Legal', color: 'text-blue-700', icon: Scale },
  { id: 'lawyers', label: 'Lawyers.com', category: 'Legal', color: 'text-red-700', icon: Gavel },
  { id: 'findlaw', label: 'FindLaw', category: 'Legal', color: 'text-orange-600', icon: Scale },
  { id: 'creditkarma', label: 'Credit Karma', category: 'Financial', color: 'text-green-500', icon: DollarSign },

  // --- 9. SOFTWARE & B2B ---
  { id: 'g2', label: 'G2', category: 'Software', color: 'text-red-500', icon: Monitor },
  { id: 'capterra', label: 'Capterra', category: 'Software', color: 'text-purple-600', icon: Database },
  { id: 'clutch', label: 'Clutch', category: 'B2B', color: 'text-blue-800', icon: Code },
  { id: 'trustradius', label: 'TrustRadius', category: 'Software', color: 'text-blue-500', icon: Star },
  { id: 'producthunt', label: 'Product Hunt', category: 'Tech', color: 'text-orange-500', icon: Search },

  // --- 10. CUSTOM ---
  { id: 'custom', label: 'Custom Website', category: 'Other', color: 'text-gray-800', icon: Globe },
];