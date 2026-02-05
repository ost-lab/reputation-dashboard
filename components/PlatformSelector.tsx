"use client";

import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file, or remove cn if not used

interface PlatformSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  activePlatformIds: string[];
  onAddClick: () => void;
  allPlatforms: any[];
}

export default function PlatformSelector({ 
  selected, 
  onSelect, 
  activePlatformIds,
  onAddClick,
  allPlatforms
}: PlatformSelectorProps) {
  
  // Filter to only show active platforms + 'all'
  const activePlatforms = [
    { id: 'all', label: 'All Sources', icon: null }, // 'All' has no specific icon usually
    ...allPlatforms.filter(p => activePlatformIds.includes(p.id))
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {activePlatforms.map((platform) => {
        const isActive = selected === platform.id;
        // ✅ FIX: Alias the icon to a capitalized variable
        const Icon = platform.icon;

        return (
          <button
            key={platform.id}
            onClick={() => onSelect(platform.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
              ${isActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {/* ✅ FIX: Render it as a Component, checking if it exists first */}
            {Icon && <Icon size={16} className={isActive ? "text-white" : platform.color} />}
            
            <span>{platform.label}</span>
          </button>
        );
      })}

      {/* Add Platform Button */}
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 transition-all"
      >
        <Plus size={16} />
        <span>Add Platform</span>
      </button>
    </div>
  );
}