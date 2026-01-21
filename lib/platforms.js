// This acts as your database of supported sites (Birdeye/Podium style)
export const MASTER_PLATFORMS = [
  // --- 1. ESSENTIALS (The Big Players) ---
  { id: 'google', label: 'Google', category: 'General', color: 'text-blue-500' },
  { id: 'facebook', label: 'Facebook', category: 'General', color: 'text-blue-600' },
  { id: 'instagram', label: 'Instagram', category: 'Social', color: 'text-pink-600' },
  { id: 'yelp', label: 'Yelp', category: 'General', color: 'text-red-500' },
  // ... existing list ...
  
  // --- 10. CUSTOM / OTHER ---
  { id: 'custom', label: 'Custom Website', category: 'Other', color: 'text-gray-800' },

  { id: 'bbb', label: 'BBB', category: 'General', color: 'text-blue-800' },
  { id: 'trustpilot', label: 'Trustpilot', category: 'General', color: 'text-green-500' },
  { id: 'yellowpages', label: 'Yellow Pages', category: 'Directories', color: 'text-yellow-600' },

  // --- 2. SOCIAL & COMMUNICATION ---
  { id: 'twitter', label: 'Twitter / X', category: 'Social', color: 'text-black' },
  { id: 'linkedin', label: 'LinkedIn', category: 'Social', color: 'text-blue-700' },
  { id: 'tiktok', label: 'TikTok', category: 'Social', color: 'text-black' },
  { id: 'youtube', label: 'YouTube', category: 'Social', color: 'text-red-600' },
  { id: 'whatsapp', label: 'WhatsApp', category: 'Chat', color: 'text-green-500' },
  { id: 'pinterest', label: 'Pinterest', category: 'Social', color: 'text-red-600' },

  // --- 3. AUTOMOTIVE (Car Dealers & Repair) ---
  { id: 'carsdotcom', label: 'Cars.com', category: 'Automotive', color: 'text-purple-600' },
  { id: 'dealerrater', label: 'DealerRater', category: 'Automotive', color: 'text-blue-500' },
  { id: 'edmunds', label: 'Edmunds', category: 'Automotive', color: 'text-blue-400' },
  { id: 'carfax', label: 'Carfax', category: 'Automotive', color: 'text-gray-700' },
  { id: 'cargurus', label: 'CarGurus', category: 'Automotive', color: 'text-red-500' },
  { id: 'autotrader', label: 'Autotrader', category: 'Automotive', color: 'text-orange-600' },

  // --- 4. HEALTHCARE (Doctors & Dentists) ---
  { id: 'healthgrades', label: 'Healthgrades', category: 'Healthcare', color: 'text-blue-500' },
  { id: 'vitals', label: 'Vitals', category: 'Healthcare', color: 'text-teal-500' },
  { id: 'zocdoc', label: 'ZocDoc', category: 'Healthcare', color: 'text-yellow-500' },
  { id: 'ratemds', label: 'RateMDs', category: 'Healthcare', color: 'text-blue-400' },
  { id: 'realself', label: 'RealSelf', category: 'Healthcare', color: 'text-pink-500' },
  { id: 'careswitch', label: 'Caring.com', category: 'Senior Care', color: 'text-purple-500' },

  // --- 5. REAL ESTATE (Agents & Property) ---
  { id: 'zillow', label: 'Zillow', category: 'Real Estate', color: 'text-blue-600' },
  { id: 'realtor', label: 'Realtor.com', category: 'Real Estate', color: 'text-red-600' },
  { id: 'trulia', label: 'Trulia', category: 'Real Estate', color: 'text-green-600' },
  { id: 'apartments', label: 'Apartments.com', category: 'Real Estate', color: 'text-gray-800' },
  { id: 'redfin', label: 'Redfin', category: 'Real Estate', color: 'text-red-500' },

  // --- 6. HOSPITALITY & TRAVEL (Hotels & Restaurants) ---
  { id: 'tripadvisor', label: 'TripAdvisor', category: 'Travel', color: 'text-green-600' },
  { id: 'opentable', label: 'OpenTable', category: 'Dining', color: 'text-red-600' },
  { id: 'expedia', label: 'Expedia', category: 'Travel', color: 'text-yellow-500' },
  { id: 'booking', label: 'Booking.com', category: 'Travel', color: 'text-blue-600' },
  { id: 'airbnb', label: 'Airbnb', category: 'Travel', color: 'text-red-500' },
  { id: 'hotels', label: 'Hotels.com', category: 'Travel', color: 'text-red-700' },
  { id: 'doordash', label: 'DoorDash', category: 'Dining', color: 'text-red-600' },

  // --- 7. HOME SERVICES & CONTRACTORS ---
  { id: 'angi', label: 'Angi (HomeAdvisor)', category: 'Services', color: 'text-green-500' },
  { id: 'thumbtack', label: 'Thumbtack', category: 'Services', color: 'text-blue-400' },
  { id: 'houzz', label: 'Houzz', category: 'Services', color: 'text-green-600' },
  { id: 'porch', label: 'Porch', category: 'Services', color: 'text-blue-500' },
  { id: 'bark', label: 'Bark', category: 'Services', color: 'text-indigo-600' },

  // --- 8. LEGAL & FINANCIAL ---
  { id: 'avvo', label: 'Avvo', category: 'Legal', color: 'text-blue-700' },
  { id: 'lawyers', label: 'Lawyers.com', category: 'Legal', color: 'text-red-700' },
  { id: 'findlaw', label: 'FindLaw', category: 'Legal', color: 'text-orange-600' },
  { id: 'creditkarma', label: 'Credit Karma', category: 'Financial', color: 'text-green-500' },

  // --- 9. SOFTWARE & B2B ---
  { id: 'g2', label: 'G2', category: 'Software', color: 'text-red-500' },
  { id: 'capterra', label: 'Capterra', category: 'Software', color: 'text-purple-600' },
  { id: 'clutch', label: 'Clutch', category: 'B2B', color: 'text-blue-800' },
  { id: 'trustradius', label: 'TrustRadius', category: 'Software', color: 'text-blue-500' },
  { id: 'producthunt', label: 'Product Hunt', category: 'Tech', color: 'text-orange-500' },
];