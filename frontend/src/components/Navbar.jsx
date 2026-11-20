import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 bg-clip-text">
              Vibe<span className="text-brand-600">Todo</span>
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        {user && (
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[150px] truncate">{user.email}</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all flex items-center space-x-1 border border-slate-200/60"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
