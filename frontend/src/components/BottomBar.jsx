import React from 'react';
import { Plus } from 'lucide-react';

export default function BottomBar({ onAddNew, activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Done' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2.5 pb-safe sm:hidden shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Thumb-friendly Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === f.id
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Thumb-friendly Floating Action Button (FAB) */}
        <button
          onClick={onAddNew}
          aria-label="Add new task"
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-thumb hover:bg-brand-700 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
