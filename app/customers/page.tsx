"use client";

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Search, Mail, Star, User, MoreVertical, Phone } from 'lucide-react';

export default function CustomersPage() {
  // FIX: Explicitly type the state array
  const [customers, setCustomers] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. MOCK DATA
  useEffect(() => {
    // Simulate API fetch
    const MOCK_DATA = [
      { id: 1, name: "Sarah Jenkins", email: "sarah@gmail.com", phone: "555-0123", avg_rating: 5.0, total_reviews: 4, status: "vip" },
      { id: 2, user: "Mike T.", name: "Mike Thompson", email: "mike.t@yahoo.com", phone: "555-0198", avg_rating: 2.5, total_reviews: 2, status: "risk" },
      { id: 3, name: "Emily Rogers", email: "emily.r@company.com", phone: "555-0144", avg_rating: 4.8, total_reviews: 12, status: "fan" },
      { id: 4, name: "David Kim", email: "dkim@tech.net", phone: "555-0112", avg_rating: 1.0, total_reviews: 1, status: "churned" },
      { id: 5, name: "Jessica Alva", email: "jess.a@gmail.com", phone: "555-0176", avg_rating: 3.5, total_reviews: 1, status: "neutral" },
    ];
    
    setCustomers(MOCK_DATA);
    setLoading(false);
  }, []);

  // 2. SEARCH FILTER
  const filteredCustomers = customers.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1">
        <Header />
        
        <main className="p-8 ml-16 md:ml-20">
          <div className="flex justify-between items-end mb-8">
             <div>
               <h1 className="text-2xl font-bold text-gray-800">Customer CRM</h1>
               <p className="text-gray-500">View and manage your customer relationships.</p>
             </div>
             <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-blue-700 transition-colors">
                + Add Customer
             </button>
          </div>

          {/* SEARCH BAR */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          {/* CUSTOMER TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                   <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Contact</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Sentiment</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                   </tr>
                </thead>
                <tbody>
                   {filteredCustomers.map((c) => {
                      // Calculate status based on rating (The logic that was failing)
                      const rating = parseFloat(c.avg_rating).toFixed(1);
                      const isFan = parseFloat(rating) >= 4;
                      const isHater = parseFloat(rating) <= 2;

                      return (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isFan ? 'bg-green-400' : isHater ? 'bg-red-400' : 'bg-gray-400'}`}>
                                    {c.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                                    <p className="text-xs text-gray-400">ID: #{c.id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-gray-600 text-xs">
                                    <Mail size={14} /> {c.email}
                                 </div>
                                 <div className="flex items-center gap-2 text-gray-600 text-xs">
                                    <Phone size={14} /> {c.phone}
                                 </div>
                              </div>
                           </td>
                           <td className="p-4">
                              <div className="flex items-center gap-2">
                                 <div className="flex text-yellow-400">
                                    <Star size={16} fill="currentColor" />
                                 </div>
                                 <span className="font-bold text-gray-800">{rating}</span>
                                 <span className="text-xs text-gray-400">({c.total_reviews} reviews)</span>
                                 
                                 {isFan && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">FAN</span>}
                                 {isHater && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">AT RISK</span>}
                              </div>
                           </td>
                           <td className="p-4 text-right">
                              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                 <MoreVertical size={16} />
                              </button>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>

             {filteredCustomers.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                   No customers found.
                </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}