"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile nav drawer automatically whenever the route changes, so
  // it never stays open after the user taps a link.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Lock page scroll behind the drawer while it's open.
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <Header onMenuClick={() => setNavOpen(true)} />
      <Sidebar isOpen={navOpen} onClose={() => setNavOpen(false)} />
      {/* Offsets: header height (54px) and sidebar width (16rem, desktop only). */}
      <main className="pt-[54px] lg:pl-64">
        <div className="p-3 sm:p-4 lg:p-5 max-w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
