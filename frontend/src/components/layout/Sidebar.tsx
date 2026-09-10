"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  AlertTriangle,
  MapPin,
  Building2,
  Landmark,
  FolderClock,
  FileBarChart2,
  BellRing,
  MessageSquareText,
  Settings,
  ShieldCheck
} from "lucide-react";
import { classNames } from "@/lib/format";
import { priorityQueueCount } from "@/lib/mockData";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: ListChecks },
  { href: "/priority-queue", label: "AI Priority Queue", icon: AlertTriangle, badge: priorityQueueCount },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/agency-performance", label: "Agency Performance", icon: Building2 },
  { href: "/constituency-insights", label: "Constituency Insights", icon: Landmark },
  { href: "/inspection-dossiers", label: "Inspection Dossiers", icon: FolderClock },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/mp-attention-centre", label: "MP Attention Centre", icon: BellRing },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy-950 text-slate-200">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <ShieldCheck size={26} className="text-emerald-400" />
        <div>
          <p className="text-sm font-bold text-white leading-tight">MPLADS</p>
          <p className="text-[10px] text-slate-400 leading-tight">AI Monitoring &amp; Audit Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600/90 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {item.label}
              </span>
              {item.badge ? (
                <span className="text-[11px] font-semibold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <Link
          href="/settings"
          className={classNames(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings" ? "bg-blue-600/90 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings size={17} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
