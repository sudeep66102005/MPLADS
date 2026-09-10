import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="lg:pl-64 p-4 sm:p-6">{children}</main>
    </div>
  );
}
