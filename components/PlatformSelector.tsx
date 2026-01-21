"use client";
import { Plus, LayoutGrid, Phone } from 'lucide-react'; 

// DO NOT IMPORT MASTER_PLATFORMS HERE

export default function PlatformSelector({ selected, onSelect, activePlatformIds, onAddClick, allPlatforms }) {
  
  const fixedOptions = [
    { id: 'all', label: 'All Sources', icon: <LayoutGrid size={18} />, color: 'text-gray-600' },
    { id: 'manual', label: 'Manual / Phone', icon: <Phone size={18} />, color: 'text-gray-500' },
  ];

  // USE THE PROP 'allPlatforms'
  // If allPlatforms is undefined (initial load), default to empty array to prevent crash
  const safeList = allPlatforms || [];
  
  const userOptions = safeList.filter(p => activePlatformIds.includes(p.id));

  const displayList = [...fixedOptions, ...userOptions];

  return (
    <div className="flex flex-wrap gap-3 pb-4">
      {displayList.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm
            ${selected === p.id 
              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
            }
          `}
        >
           {/* If p.icon exists use it, otherwise use First Letter */}
          <div className={`${selected === p.id ? 'text-blue-600' : p.color || 'text-gray-500'}`}>
            {p.icon ? p.icon : <span className="font-bold">{p.label ? p.label.charAt(0) : '?'}</span>}
          </div>
          <span className={`font-bold text-sm ${selected === p.id ? 'text-blue-800' : 'text-gray-600'}`}>
            {p.label}
          </span>
        </button>
      ))}

      {/* Add Button */}
      <button 
        onClick={onAddClick}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 text-gray-400 transition-all"
      >
        <Plus size={18} />
        <span className="font-bold text-sm">Add Platform</span>
      </button>
    </div>
  );
}