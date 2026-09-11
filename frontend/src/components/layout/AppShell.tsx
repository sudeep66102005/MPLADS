import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Sidebar />
      {/* Offsets: header height (54px) and sidebar width (16rem). */}
      <main className="pt-[54px] lg:pl-64">
        <div className="p-4 sm:p-5">{children}</div>
      </main>
    </div>
  );
}
