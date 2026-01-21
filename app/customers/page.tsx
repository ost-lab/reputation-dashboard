"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { User, Star, MapPin, Calendar } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Insights</h1>

          {/* Grid Layout for Customer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {customers.map((c, index) => {
               // Calculate status based on rating
               const rating = parseFloat(c.avg_rating).toFixed(1);
               const isFan = rating >= 4;
               const isHater = rating <= 2;
               
               return (
                 <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white
                          ${isFan ? 'bg-green-500' : isHater ? 'bg-red-500' : 'bg-yellow-500'}
                       `}>
                          {c.user_name.charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-800">{c.user_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                            ${isFan ? 'bg-green-100 text-green-700' : isHater ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                          `}>
                            {isFan ? 'Super Fan' : isHater ? 'At Risk' : 'Neutral'}
                          </span>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between text-sm border-b pb-2">
                          <span className="text-gray-500 flex items-center gap-2"><Star size={14}/> Avg Rating</span>
                          <span className="font-bold text-gray-800">{rating} / 5.0</span>
                       </div>
                       <div className="flex justify-between text-sm border-b pb-2">
                          <span className="text-gray-500 flex items-center gap-2"><User size={14}/> Total Reviews</span>
                          <span className="font-bold text-gray-800">{c.total_reviews}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-2"><MapPin size={14}/> Sources</span>
                          <span className="font-bold text-gray-800 text-xs text-right max-w-[150px] truncate">{c.sources}</span>
                       </div>
                    </div>
                 </div>
               )
            })}
            
            {customers.length === 0 && !loading && (
               <div className="col-span-3 text-center text-gray-400 py-12">
                  No customer data yet. Sync or add reviews!
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}