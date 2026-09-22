"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
        {pathname !== "/workspace" && (
          <div className="mx-3 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            These dashboard screens show illustrative demo data.{" "}
            <Link className="font-semibold underline" href="/workspace">Open the connected workspace for saved project records and inspections.</Link>
          </div>
        )}
        <div className="p-3 sm:p-4 lg:p-5 max-w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
