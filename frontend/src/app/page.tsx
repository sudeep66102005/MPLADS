import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, ExportButton } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { MapPanel } from "@/components/map/MapPanel";
import { MapLegend } from "@/components/map/MapLegend";
import { SectorPieChart } from "@/components/charts/SectorPieChart";
import { ProjectTrendChart } from "@/components/charts/ProjectTrendChart";
import {
  Folder,
  AlertTriangle,
  Clock,
  IndianRupee,
  PieChart as PieIcon,
  BarChart3,
  ChevronDown,
  MapPin as MapPinIcon,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import {
  bengaluruAiInsights,
  bengaluruKpis,
  bengaluruProjectTrend,
  bengaluruSectorDistribution,
  bengaluruSelectedLocation,
  bengaluruTopIssues,
  bengaluruUnderservedWards,
  bengaluruMapPins,
  bengaluruHeatZones,
  BENGALURU_CENTRE
} from "@/lib/mockData";

const toneIcon = {
  positive: CheckCircle2,
  warning: AlertCircle,
  info: Info
};

const toneColor = {
  positive: "text-emerald-600",
  warning: "text-amber-600",
  info: "text-blue-600"
};

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="MPLADS Project Map"
        subtitle="Geospatial view of projects, risks and development coverage"
        right={
          <>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              <MapPinIcon size={14} className="text-blue-600" />
              {bengaluruSelectedLocation.name}, {bengaluruSelectedLocation.state}
              <ChevronDown size={14} />
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              Apr 2021 – Dec 2024
              <ChevronDown size={14} />
            </button>
            <ExportButton label="Export Map" />
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard
          icon={Folder}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Projects"
          value={String(bengaluruKpis.totalProjects)}
          subValue={`↑ ${bengaluruKpis.totalProjectsYoY}% vs. last year`}
          subValueColor="text-emerald-600"
          trend
        />
        <KpiCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="High Risk"
          value={String(bengaluruKpis.highRisk)}
          subValue={`(${bengaluruKpis.highRiskPct}%)`}
          subValueColor="text-red-600"
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Delayed"
          value={String(bengaluruKpis.delayed)}
          subValue={`(${bengaluruKpis.delayedPct}%)`}
          subValueColor="text-red-600"
        />
        <KpiCard
          icon={IndianRupee}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Allocation"
          value={`₹ ${bengaluruKpis.totalAllocationCr} Cr`}
        />
        <KpiCard
          icon={PieIcon}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Fund Utilization"
          value={`${bengaluruKpis.fundUtilizationPct}%`}
        />
        <KpiCard
          icon={BarChart3}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label="Development Gaps"
          value={String(bengaluruKpis.developmentGaps)}
          subValue="Key underserved areas"
        />
      </div>

      {/* Filters row */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <input
            placeholder="Search by project name, location or ID..."
            className="w-full text-sm rounded-lg border border-slate-200 pl-3 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {["Taluk: All", "Assembly Constituency: All", "Project Status: All", "Agency: All", "AI Risk Level: All"].map(
          (f) => (
            <button
              key={f}
              className="inline-flex items-center gap-1 text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50"
            >
              {f}
              <ChevronDown size={12} />
            </button>
          )
        )}
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg px-3 py-2">
          More Filters
        </button>
      </div>

      {/* Map + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-3">
          <MapLegend />
          <MapPanel
            center={BENGALURU_CENTRE}
            zoom={11}
            pins={bengaluruMapPins}
            heatZones={bengaluruHeatZones}
            activePinId="6"
          />
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-800">Selected Location</p>
              <button className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-3">
              <MapPinIcon size={14} className="text-blue-600" />
              {bengaluruSelectedLocation.name}
            </div>
            <p className="text-xs text-slate-400 mb-3">{bengaluruSelectedLocation.state}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">{bengaluruSelectedLocation.totalProjects}</p>
                <p className="text-[10px] text-slate-400">Total Projects</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">₹{bengaluruSelectedLocation.totalAllocationCr} Cr</p>
                <p className="text-[10px] text-slate-400">Total Allocation</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">{bengaluruSelectedLocation.fundUtilizationPct}%</p>
                <p className="text-[10px] text-slate-400">Fund Utilization</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">Top Issues in Bengaluru</p>
              <a className="link-muted" href="#">
                View All →
              </a>
            </div>
            <div className="space-y-3">
              {bengaluruTopIssues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-2">
                  <Badge color={issue.severity === "High" ? "red" : issue.severity === "Medium" ? "amber" : "blue"}>
                    {issue.severity === "High" ? "!" : issue.severity === "Medium" ? "!" : "i"}
                  </Badge>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{issue.title}</p>
                    <p className="text-[11px] text-slate-500">{issue.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">Underserved Areas (Ward Level)</p>
              <a className="link-muted" href="#">
                View All →
              </a>
            </div>
            <div className="space-y-2.5">
              {bengaluruUnderservedWards.map((w) => (
                <div key={w.rank} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {w.rank}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{w.area}</p>
                    <p className="text-[11px] text-slate-500">{w.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800">Sector-wise Project Distribution</p>
          <p className="text-xs text-slate-400 mb-2">Total Projects: {bengaluruKpis.totalProjects}</p>
          <SectorPieChart data={bengaluruSectorDistribution} centerLabel={String(bengaluruKpis.totalProjects)} />
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Project Trend in Bengaluru</p>
          <ProjectTrendChart data={bengaluruProjectTrend} />
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-500" />
            <p className="text-sm font-semibold text-slate-800">AI Insights</p>
          </div>
          <div className="space-y-3">
            {bengaluruAiInsights.map((insight) => {
              const Icon = toneIcon[insight.tone];
              return (
                <div key={insight.id} className="flex items-start gap-2">
                  <Icon size={14} className={`${toneColor[insight.tone]} mt-0.5 shrink-0`} />
                  <p className="text-xs text-slate-600">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
