import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2 border-t border-slate-200/80 px-1">
      {/* Information text */}
      <div className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
        Showing <span className="text-slate-800 font-semibold">{startItem}-{endItem}</span> of{' '}
        <span className="text-slate-800 font-semibold">{total}</span> tasks
      </div>

      {/* Touch-friendly controls */}
      <div className="flex items-center space-x-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1 min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <div className="px-3 py-1.5 min-h-[44px] flex items-center justify-center text-xs font-bold text-slate-700 bg-slate-100/80 rounded-xl border border-slate-200/60 min-w-[85px] text-center">
          {page} / {totalPages || 1}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1 min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95 transition"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
