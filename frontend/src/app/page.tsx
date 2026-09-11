import { AppShell } from "@/components/layout/AppShell";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { PriorityQueueCard } from "@/components/dashboard/PriorityQueueCard";
import { AttentionCentreCard } from "@/components/dashboard/AttentionCentreCard";
import { TopAgenciesCard } from "@/components/dashboard/TopAgenciesCard";
import { BlockBreakdownCard } from "@/components/dashboard/BlockBreakdownCard";
import { AiInsightCard, GovernanceQuote } from "@/components/dashboard/AiInsightCard";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { FundUtilizationChart } from "@/components/charts/FundUtilizationChart";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Calendar,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import {
  currentUser,
  dashboardKpis,
  dashboardMeta,
  fundUtilizationTrend,
  statusDistribution
} from "@/lib/mockData";

export default function DashboardPage() {
  const firstName = currentUser.name;

  return (
    <AppShell>
      {/* Greeting row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[21px] font-bold text-slate-900 leading-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Here&apos;s the overview of MPLADS projects in your constituency
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button className="hidden sm:inline-flex items-center gap-1.5 text-[11.5px] text-slate-500 hover:text-slate-700">
            Last updated: {dashboardMeta.lastUpdated}
            <ArrowRight size={12} />
          </button>
          <button className="inline-flex items-center gap-2 text-[12px] font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 w-full md:w-auto justify-center">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{dashboardMeta.dateRange}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <KpiTile
          icon={Layers}
          tint="blue"
          label="Total Projects"
          value={String(dashboardKpis.totalProjects.value)}
          deltaPct={dashboardKpis.totalProjects.deltaPct}
          tone="positive"
        />
        <KpiTile
          icon={CheckCircle2}
          tint="green"
          label="Completed"
          value={String(dashboardKpis.completed.value)}
          deltaPct={dashboardKpis.completed.deltaPct}
          tone="positive"
        />
        <KpiTile
          icon={Clock}
          tint="red"
          label="Delayed"
          value={String(dashboardKpis.delayed.value)}
          deltaPct={dashboardKpis.delayed.deltaPct}
          tone="negative"
        />
        <KpiTile
          icon={AlertTriangle}
          tint="amber"
          label="Needs Attention"
          value={String(dashboardKpis.needsAttention.value)}
          deltaPct={dashboardKpis.needsAttention.deltaPct}
          tone="warning"
        />
        <KpiTile
          icon={IndianRupee}
          tint="plain"
          label="Total Allocated"
          value={`₹ ${dashboardKpis.totalAllocatedCr} Cr`}
        >
          <div className="mt-1">
            <p className="text-[10.5px] text-emerald-600 font-medium mb-1">
              Utilized: {dashboardKpis.utilizedPct}%
            </p>
            <ProgressBar value={dashboardKpis.utilizedPct} color="bg-emerald-500" height={5} />
          </div>
        </KpiTile>
      </div>

      {/* Main grid: two content columns + a right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_320px] gap-4 items-start">
        {/* Project Distribution (Status) */}
        <section className="card p-4">
          <h2 className="text-sm font-bold text-slate-800 mb-2">Project Distribution (Status)</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <StatusDonutChart data={statusDistribution} total={dashboardKpis.totalProjects.value} />
            <ul className="space-y-2.5 min-w-0 w-full flex-1">
              {statusDistribution.map((status) => (
                <li key={status.label} className="flex items-center gap-2 text-[11.5px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-slate-600 flex-1 truncate">{status.label}</span>
                  <span className="font-semibold text-slate-800 shrink-0">
                    {status.value}{" "}
                    <span className="text-slate-400 font-normal">({status.pct}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Map replaced by a block-wise breakdown (dashboard only) */}
        <BlockBreakdownCard />

        {/* Right rail spans both content rows */}
        <div className="space-y-4 xl:row-span-3">
          <PriorityQueueCard />
          <AttentionCentreCard />
          <GovernanceQuote />
        </div>

        {/* Fund Utilization Trend */}
        <section className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-y-1 mb-1">
            <h2 className="text-sm font-bold text-slate-800">Fund Utilization Trend</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-[3px] rounded-full bg-blue-500" /> Allocated
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-[3px] rounded-full bg-emerald-500" /> Utilized
              </span>
            </div>
          </div>

          <div className="relative">
            <FundUtilizationChart data={fundUtilizationTrend} />
            <div className="absolute top-1 right-1 space-y-1">
              <span className="block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
                ₹ {dashboardKpis.totalAllocatedCr} Cr
              </span>
              <span className="block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
                ₹ 267.8 Cr
              </span>
            </div>
          </div>
        </section>

        {/* Top Agencies */}
        <TopAgenciesCard />

        {/* AI Insight spans the two content columns */}
        <div className="xl:col-span-2">
          <AiInsightCard />
        </div>
      </div>
    </AppShell>
  );
}
