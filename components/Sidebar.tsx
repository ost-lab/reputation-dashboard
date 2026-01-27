"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, CreditCard, Settings, Swords, Code } from 'lucide-react';
import { useSession } from "next-auth/react"; // ✅ Import Session

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession(); // ✅ Use real session data

  // Check if user is business type
  // @ts-ignore (ignore type error until we fix d.ts)
  const isBusiness = session?.user?.accountType === 'business';

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Reviews', icon: <MessageSquare size={20} />, path: '/reviews' },
    
    // ✅ Only show if real business account
    ...(isBusiness ? [
      { name: 'Competitors', icon: <Swords size={20} />, path: '/competitors' }
    ] : []),

    { name: 'Widgets', icon: <Code size={20} />, path: '/widgets' },
    { name: 'Billing', icon: <CreditCard size={20} />, path: '/billing' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="h-screen w-16 md:w-20 bg-white border-r flex flex-col items-center py-6 fixed left-0 top-0 z-50">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 mb-8">
        R
      </div>
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`
                p-3 rounded-xl flex items-center justify-center transition-all duration-200 group relative
                ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
              `}
            >
              {item.icon}
              <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}