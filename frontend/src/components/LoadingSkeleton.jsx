import React from 'react';

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm animate-pulse flex items-start space-x-3.5"
        >
          {/* Checkbox Skeleton */}
          <div className="w-6 h-6 rounded-lg bg-slate-200 shrink-0 mt-0.5" />

          {/* Text Content Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
          </div>

          {/* Actions Skeleton */}
          <div className="flex space-x-1">
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
