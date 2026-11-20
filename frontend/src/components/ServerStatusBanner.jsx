import React from 'react';
import { useServerHealth } from '../context/ServerHealthContext';
import { Loader2, CheckCircle2, CloudRain } from 'lucide-react';

export default function ServerStatusBanner() {
  const { isWakingUp, justWokeUp, attempts } = useServerHealth();

  if (!isWakingUp && !justWokeUp) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 animate-in slide-in-from-top duration-300 pointer-events-auto">
      {isWakingUp && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg px-4 py-3 sm:px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold tracking-tight truncate">
                  Cloud server is waking up, please wait...
                </p>
                <p className="text-[11px] text-amber-100 opacity-90 truncate">
                  Render instances sleep when idle. Starting up database (attempt #{attempts})...
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-1.5 px-2.5 py-1 bg-black/15 rounded-full text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
              <span>Starting</span>
            </div>
          </div>
        </div>
      )}

      {justWokeUp && (
        <div className="bg-emerald-600 text-white shadow-lg px-4 py-2.5 sm:px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              Server is online! Ready to use.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
