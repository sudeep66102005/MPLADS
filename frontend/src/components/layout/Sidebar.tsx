"use client";

import { useEffect } from "react";
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
  X,
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

/**
 * The nav link list, shared between the fixed desktop sidebar and the mobile
 * drawer so the two never drift out of sync.
 */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
          onClick={onNavigate}
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
    </>
  );
}

interface SidebarProps {
  /** Whether the mobile drawer is open. Ignored by the desktop sidebar, which
   * is always visible at the lg breakpoint and above. */
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Let Escape close the drawer, same as clicking the backdrop or the X button.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop: fixed sidebar, always visible at lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:top-[54px] lg:bottom-0 lg:w-64 bg-navy-950 text-slate-300">
        <SidebarNav />
      </aside>

      {/* Mobile: backdrop + slide-in drawer, lg and up never render this */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={classNames(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={classNames(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-navy-950 text-slate-300 flex flex-col lg:hidden",
          "transform transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-[54px] shrink-0 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Emblem size={24} />
            <span className="text-sm font-bold text-white">MPLADS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}
