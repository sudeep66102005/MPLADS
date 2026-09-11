"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { currentUser } from "@/lib/mockData";
import { Emblem } from "./Emblem";

/**
 * Full-width top bar. The brand lockup occupies the left column so it lines up
 * with the sidebar beneath it (both share the same navy surface, reading as one
 * continuous panel).
 */
export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 h-[54px] bg-navy-950 flex items-stretch">
      {/* Brand lockup — width matches the sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 items-center gap-2.5 px-4">
        <Emblem size={30} />
        <div className="leading-none">
          <p className="text-[15px] font-bold text-white tracking-tight">MPLADS</p>
          <p className="text-[9px] text-slate-300 mt-[3px]">AI Monitoring &amp; Audit Intelligence</p>
          <p className="text-[8px] text-slate-500 mt-[2px]">Smarter Oversight. Greater Impact.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 px-4 lg:px-6 min-w-0">
        <div className="lg:hidden flex items-center gap-2">
          <Emblem size={24} />
          <span className="text-sm font-bold text-white">MPLADS</span>
        </div>

        {/* Search — centered in the remaining space */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className="relative w-full max-w-[420px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search projects, constituencies, agencies..."
              aria-label="Search projects, constituencies, agencies"
              className="w-full bg-navy-800/80 text-slate-200 placeholder:text-slate-500 text-[11.5px] rounded-full pl-8 pr-3 py-[7px] border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-3.5 shrink-0">
          <button aria-label="Notifications" className="relative text-slate-300 hover:text-white">
            <Bell size={17} />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-[15px] h-[15px] flex items-center justify-center">
              5
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden sm:block leading-none">
              <p className="text-[11.5px] font-semibold text-white">{currentUser.name}</p>
              <p className="text-[9.5px] text-slate-400 mt-[3px]">{currentUser.role}</p>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
