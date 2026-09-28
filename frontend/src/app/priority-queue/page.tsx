import Link from "next/link";
import { AlertTriangle, BrainCircuit, Calendar, ChevronDown, Eye, Filter, Search, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, ExportButton } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { dashboardPriorityQueue } from "@/lib/mockData";

const severityColor = {
  CRITICAL: "red",
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "blue"
} as const;

export default function PriorityQueuePage() {
  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "AI Priority Queue" }]}
        title="AI Priority Queue"
        subtitle="Projects ranked by AI health, delay probability and monitoring urgency"
        right={<><ExportButton label="Export Queue" /><button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"><Calendar size={15} /> Apr 2021 – Dec 2024 <ChevronDown size={14} /></button></>}
      />

      <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Total Priorities", value: "21", detail: "Need review", color: "text-blue-700", icon: BrainCircuit },
          { label: "Critical", value: "5", detail: "Immediate action", color: "text-red-600", icon: ShieldAlert },
          { label: "High Risk", value: "7", detail: "Review this week", color: "text-orange-600", icon: AlertTriangle },
          { label: "Likely Delayed", value: "9", detail: "Next 90 days", color: "text-amber-600", icon: Calendar },
          { label: "New Alerts", value: "5", detail: "Since last review", color: "text-purple-600", icon: BrainCircuit }
        ].map(({ label, value, detail, color, icon: Icon }) => (
          <section key={label} className="card flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50"><Icon size={20} className={color} /></span>
            <div><p className="text-[11px] text-slate-500">{label}</p><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="text-[10px] text-slate-400">{detail}</p></div>
          </section>
        ))}
      </div>

      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <label className="relative min-w-[260px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" placeholder="Search project, constituency or agency..." /></label>
        {["Risk: All", "Constituency: All", "Agency: All", "Status: All"].map(item => <button key={item} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">{item} <ChevronDown size={12} className="inline" /></button>)}
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"><Filter size={13} /> More Filters</button>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-bold text-slate-800">Priority-ranked projects</h2><p className="text-[11px] text-slate-500">Ordered by lowest AI health score and highest intervention need</p></div><button className="text-xs text-slate-600">Sort: Highest Priority <ChevronDown size={12} className="inline" /></button></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-400"><th className="px-4 py-3">Priority</th><th className="px-3 py-3">Project</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">AI Health</th><th className="px-3 py-3">Key reason</th><th className="px-3 py-3">Recommended action</th><th className="px-4 py-3">View</th></tr></thead>
            <tbody>{dashboardPriorityQueue.map((item, index) => <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/70"><td className="px-4 py-4"><span className="mr-2 font-bold text-slate-400">#{index + 1}</span><Badge color={severityColor[item.severity]}>{item.severity}</Badge></td><td className="px-3 py-4"><p className="font-semibold text-slate-800">{item.name}</p><p className="text-[10px] text-slate-400">MPLADS/2023/00{item.id}</p></td><td className="px-3 py-4 text-slate-600">{item.location}</td><td className="px-3 py-4"><strong className={item.healthScore < 50 ? "text-red-600" : item.healthScore < 70 ? "text-amber-600" : "text-blue-600"}>{item.healthScore}/100</strong><div className="mt-1 h-1.5 w-20 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-blue-500" style={{width:`${item.healthScore}%`}} /></div></td><td className="px-3 py-4 text-slate-600">{item.reason}</td><td className="px-3 py-4 text-slate-600">{item.severity === "CRITICAL" ? "Schedule field inspection" : item.severity === "HIGH" ? "Request agency update" : "Continue monitoring"}</td><td className="px-4 py-4"><Link href={`/projects/${item.id}`} aria-label={`View ${item.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600"><Eye size={14} /></Link></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
