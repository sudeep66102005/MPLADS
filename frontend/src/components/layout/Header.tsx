"use client";

import { Search, Bell, ChevronDown, ShieldCheck } from "lucide-react";
import { currentUser } from "@/lib/mockData";

export function Header() {
  return (
    <header className="lg:pl-64 sticky top-0 z-30 bg-navy-950 border-b border-white/10">
      <div className="h-16 px-4 sm:px-6 flex items-center gap-4">
        <div className="flex items-center gap-2 lg:hidden">
          <ShieldCheck size={22} className="text-emerald-400" />
          <span className="text-white font-bold text-sm">MPLADS</span>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, constituencies, agencies..."
              className="w-full bg-navy-800 text-slate-200 placeholder:text-slate-500 text-sm rounded-lg pl-9 pr-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button
            aria-label="Notifications"
            className="relative text-slate-300 hover:text-white transition-colors"
          >
            <Bell size={19} />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              5
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400">{currentUser.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
