import React from 'react';
import { ClipboardList, PlusCircle, SearchX } from 'lucide-react';

export default function EmptyState({ isSearching, onAddNew, onClearSearch }) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">No matching todos</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-5">
          We couldn't find any tasks matching your search query. Try typing something else.
        </p>
        <button
          onClick={onClearSearch}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition"
        >
          Clear search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-inner">
        <ClipboardList className="w-10 h-10 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No tasks yet!</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
        Keep your day organized and stress-free. Tap below to capture your first todo.
      </p>
      <button
        onClick={onAddNew}
        className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-2xl text-sm shadow-md shadow-brand-500/25 hover:bg-brand-700 active:scale-95 transition flex items-center space-x-2"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Create your first task</span>
      </button>
    </div>
  );
}
