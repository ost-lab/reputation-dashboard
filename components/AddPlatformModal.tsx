"use client";

import { X, Search, Check } from 'lucide-react';
import { useState } from 'react';
import { MASTER_PLATFORMS } from '@/lib/platforms';

interface AddPlatformModalProps {
  currentIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
  onCustomAdded?: () => void;
}

export default function AddPlatformModal({ currentIds, onClose, onSave }: AddPlatformModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(currentIds);
  const [search, setSearch] = useState("");

  const togglePlatform = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(pid => pid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filter platforms based on search
  const filteredPlatforms = MASTER_PLATFORMS.filter(p => 
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Manage Platforms</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search platforms (e.g. Google, Yelp...)"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPlatforms.map((platform) => {
              const isSelected = selectedIds.includes(platform.id);
              // ✅ FIX: Capitalize Variable
              const Icon = platform.icon;

              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border text-left transition-all
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm text-gray-700`}>
                      {/* ✅ FIX: Render Component */}
                      {Icon && <Icon size={20} className={platform.color} />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{platform.label}</div>
                      <div className="text-xs text-gray-500">{platform.category}</div>
                    </div>
                  </div>
                  {isSelected && <Check size={20} className="text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(selectedIds);
              onClose();
            }}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}