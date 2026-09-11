"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  AlertTriangle,
  MapPin,
  BarChart3,
  Landmark,
  FolderClock,
  FileBarChart2,
  BellRing,
  MessageSquareText,
  Settings,
  type LucideIcon
} from "lucide-react";
import { classNames } from "@/lib/format";
import { priorityQueueCount } from "@/lib/mockData";
import { Emblem } from "./Emblem";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: ListChecks },
  { href: "/priority-queue", label: "AI Priority Queue", icon: AlertTriangle, badge: priorityQueueCount },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/agency-performance", label: "Agency Performance", icon: BarChart3 },
  { href: "/constituency-insights", label: "Constituency Insights", icon: Landmark },
  { href: "/inspection-dossiers", label: "Inspection Dossiers", icon: FolderClock },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/mp-attention-centre", label: "MP Attention Centre", icon: BellRing },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:top-[54px] lg:bottom-0 lg:w-64 bg-navy-950 text-slate-300">
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={classNames(
                "flex items-center justify-between gap-2 rounded-lg px-3 py-[9px] text-[12.5px] transition-colors",
                active
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
              )}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge ? (
                <span className="text-[9.5px] font-bold bg-red-500 text-white rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center shrink-0">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-2.5 pb-2">
        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={classNames(
            "flex items-center gap-3 rounded-lg px-3 py-[9px] text-[12.5px] transition-colors",
            pathname === "/settings"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
          )}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>

      {/* Ministry attribution footer */}
      <div className="border-t border-white/10 px-4 py-3 flex items-start gap-2.5">
        <Emblem size={26} />
        <div className="leading-tight min-w-0">
          <p className="text-[10.5px] font-semibold text-slate-200">MPLADS</p>
          <p className="text-[8.5px] text-slate-500">
            Ministry of Statistics &amp;<br />
            Programme Implementation
          </p>
          <p className="text-[8.5px] text-slate-500 mt-0.5">Government of India</p>
        </div>
      </div>
    </aside>
  );
}
