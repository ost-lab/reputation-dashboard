"use client";

import { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { MASTER_PLATFORMS } from '../lib/platforms';

// FIX: Define the Props Interface
interface AddPlatformModalProps {
  currentIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
  onCustomAdded?: () => void;
}

export default function AddPlatformModal({ currentIds, onSave, onClose, onCustomAdded }: AddPlatformModalProps) {
  // FIX: Explicitly type the Set as containing strings
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentIds));
  const [search, setSearch] = useState('');

  // 1. Helper to get ALL known platforms (Master + Custom)
  const getKnownPlatforms = () => {
    // We treat this as 'any' to avoid strict type issues with local storage data
    const customDefs = JSON.parse(localStorage.getItem('custom_platform_definitions') || '[]');
    return [...MASTER_PLATFORMS, ...customDefs];
  };

  const knownPlatforms = getKnownPlatforms();

  const togglePlatform = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Filter the combined list
  const filteredList = knownPlatforms.filter((p: any) => 
    p.label.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  // --- FIX: PREVENT DUPLICATES ---
  const handleCreateCustom = () => {
    if (!search) return;
    const searchTerm = search.trim();

    // 1. CHECK: Does this already exist? (Case insensitive)
    const existing = knownPlatforms.find((p: any) => p.label.toLowerCase() === searchTerm.toLowerCase());

    if (existing) {
       // A. It exists! Just select it.
       const newSet = new Set(selectedIds);
       newSet.add(existing.id);
       onSave(Array.from(newSet)); // Save and close
       onClose();
       return; // Stop here!
    }

    // 2. CREATE: It's truly new.
    const newId = `custom-${searchTerm.toLowerCase().replace(/\s+/g, '-')}`;
    
    const newPlatform = {
      id: newId,
      label: searchTerm, 
      category: 'Custom',
      color: 'text-gray-600',
      isCustom: true 
    };

    const existingCustoms = JSON.parse(localStorage.getItem('custom_platform_definitions') || '[]');
    existingCustoms.push(newPlatform);
    localStorage.setItem('custom_platform_definitions', JSON.stringify(existingCustoms));

    if (onCustomAdded) onCustomAdded(); 

    const newSet = new Set(selectedIds);
    newSet.add(newId);
    onSave(Array.from(newSet)); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add Review Sources</h2>
            <p className="text-sm text-gray-500">Search for a platform to add it to your dashboard.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search (e.g. 'Indeed', 'Glassdoor')..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {filteredList.map((p: any) => {
              const isSelected = selectedIds.has(p.id);
              return (
                <button 
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border transition-all text-left group
                    ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${isSelected ? 'bg-white border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                      {p.label.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{p.label}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{p.category}</div>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-blue-400"></div>
                  )}
                </button>
              );
            })}

            {/* ONLY SHOW "ADD" BUTTON IF NO EXACT MATCH FOUND */}
            {search.length > 0 && !filteredList.some((p: any) => p.label.toLowerCase() === search.toLowerCase()) && (
               <button 
                 onClick={handleCreateCustom}
                 className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-all text-center gap-2"
               >
                 <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                    <Plus size={24} />
                 </div>
                 <div>
                    <div className="font-bold text-sm text-blue-800">Add "{search}"</div>
                    <div className="text-[10px] text-blue-600">Not in list? Add it manually.</div>
                 </div>
               </button>
            )}

          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={() => { onSave(Array.from(selectedIds)); onClose(); }} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}