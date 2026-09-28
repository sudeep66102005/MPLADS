import { AppShell } from "@/components/layout/AppShell";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { PriorityQueueCard } from "@/components/dashboard/PriorityQueueCard";
import { AttentionCentreCard } from "@/components/dashboard/AttentionCentreCard";
import { TopAgenciesCard } from "@/components/dashboard/TopAgenciesCard";
import { DashboardProjectMap } from "@/components/dashboard/DashboardProjectMap";
import { AiInsightCard, GovernanceQuote } from "@/components/dashboard/AiInsightCard";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { FundUtilizationChart } from "@/components/charts/FundUtilizationChart";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Layers, CheckCircle2, Clock, AlertTriangle, IndianRupee, Calendar, ChevronDown, ArrowRight } from "lucide-react";
import { currentUser, dashboardKpis, dashboardMeta, fundUtilizationTrend, statusDistribution } from "@/lib/mockData";

export function DashboardHome() {
  return (
    <AppShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-slate-950">Welcome, {currentUser.name}</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">Here&apos;s the overview of MPLADS projects in your constituency</p>
        </div>
        <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
          <button className="hidden items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 md:inline-flex">
            Last updated: {dashboardMeta.lastUpdated}<ArrowRight size={12} />
          </button>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11.5px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto">
            <Calendar size={14} className="shrink-0 text-slate-500" />
            <span className="truncate">{dashboardMeta.dateRange}</span>
            <ChevronDown size={14} className="shrink-0 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiTile icon={Layers} tint="blue" label="Total Projects" value={String(dashboardKpis.totalProjects.value)} deltaPct={dashboardKpis.totalProjects.deltaPct} tone="positive" />
        <KpiTile icon={CheckCircle2} tint="green" label="Completed" value={String(dashboardKpis.completed.value)} deltaPct={dashboardKpis.completed.deltaPct} tone="positive" />
        <KpiTile icon={Clock} tint="red" label="Delayed" value={String(dashboardKpis.delayed.value)} deltaPct={dashboardKpis.delayed.deltaPct} tone="negative" />
        <KpiTile icon={AlertTriangle} tint="amber" label="Needs Attention" value={String(dashboardKpis.needsAttention.value)} deltaPct={dashboardKpis.needsAttention.deltaPct} tone="warning" />
        <KpiTile icon={IndianRupee} tint="plain" label="Total Allocated" value={`₹ ${dashboardKpis.totalAllocatedCr} Cr`}>
          <div className="mt-1">
            <p className="mb-1 text-[10.5px] font-medium text-emerald-600">Utilized: {dashboardKpis.utilizedPct}%</p>
            <ProgressBar value={dashboardKpis.utilizedPct} color="bg-emerald-500" height={5} />
          </div>
        </KpiTile>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)_360px]">
        <section className="card p-4 h-full">
          <h2 className="mb-2 text-sm font-bold text-slate-800">Project Distribution (Status)</h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <StatusDonutChart data={statusDistribution} total={dashboardKpis.totalProjects.value} />
            <ul className="w-full min-w-0 flex-1 space-y-2.5">
              {statusDistribution.map((status) => (
                <li key={status.label} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="flex-1 truncate text-slate-600">{status.label}</span>
                  <span className="shrink-0 font-semibold text-slate-800">{status.value} <span className="font-normal text-slate-400">({status.pct}%)</span></span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <DashboardProjectMap />

        <div className="space-y-3 xl:row-span-3">
          <PriorityQueueCard />
          <AttentionCentreCard />
          <GovernanceQuote />
        </div>

        <section className="card p-4">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-y-1">
            <h2 className="text-sm font-bold text-slate-800">Fund Utilization Trend</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-slate-500"><span className="h-[3px] w-2.5 rounded-full bg-blue-500" /> Allocated</span>
              <span className="flex items-center gap-1.5 text-slate-500"><span className="h-[3px] w-2.5 rounded-full bg-emerald-500" /> Utilized</span>
            </div>
          </div>
          <div className="relative">
            <FundUtilizationChart data={fundUtilizationTrend} />
            <div className="absolute right-1 top-1 space-y-1">
              <span className="block rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">₹ {dashboardKpis.totalAllocatedCr} Cr</span>
              <span className="block rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">₹ 267.8 Cr</span>
            </div>
          </div>
        </section>

        <TopAgenciesCard />
        <div className="xl:col-span-2"><AiInsightCard /></div>
      </div>
    </AppShell>
  );
}
