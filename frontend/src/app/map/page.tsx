import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, ExportButton } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { MapPanel } from "@/components/map/MapPanel";
import {
  Folder,
  AlertTriangle,
  Clock,
  IndianRupee,
  BarChart3,
  ChevronDown,
  MapPin as MapPinIcon,
  Target,
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import {
  bhopalAgencyClusters,
  bhopalKpis,
  bhopalNearbyProjects,
  bhopalProjectDensity,
  bhopalRiskHotspots,
  bhopalSelectedProject,
  bhopalUnderservedAreas,
  bhopalMapPins,
  bhopalHeatZones,
  BHOPAL_CENTRE
} from "@/lib/mockData";
import { riskBadgeColor } from "@/components/ui/Badge";

export default function MapViewPage() {
  return (
    <AppShell>
      <PageHeader
        title="MPLADS Project Map"
        subtitle="Geospatial view of projects, risks and development coverage"
        right={
          <>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              Madhya Pradesh
              <ChevronDown size={14} />
            </button>
            <ExportButton label="Export Map" />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <KpiCard
          icon={Folder}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Projects"
          value={String(bhopalKpis.totalProjects)}
          subValue={`↑ ${bhopalKpis.totalProjectsYoY}% vs. last year`}
          subValueColor="text-emerald-600"
          trend
        />
        <KpiCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="High Risk"
          value={String(bhopalKpis.highRisk)}
          subValue={`(${bhopalKpis.highRiskPct}%)`}
          subValueColor="text-red-600"
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Delayed"
          value={String(bhopalKpis.delayed)}
          subValue={`(${bhopalKpis.delayedPct}%)`}
          subValueColor="text-red-600"
        />
        <KpiCard
          icon={IndianRupee}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Financial Anomalies"
          value={String(bhopalKpis.financialAnomalies)}
          subValue={`(${bhopalKpis.financialAnomaliesPct}%)`}
          subValueColor="text-red-600"
        />
        <KpiCard
          icon={BarChart3}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label="Development Gaps"
          value={String(bhopalKpis.developmentGaps)}
          subValue="Key underserved areas"
        />
      </div>

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <input
          placeholder="Search by project name, location or ID..."
          className="flex-1 min-w-[220px] text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {["State: Madhya Pradesh", "District: Bhopal", "Constituency: All", "Project Status: All", "AI Risk Level: All", "Agency: All", "Project Type: All"].map(
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mb-4">
        <div className="relative">
          {/* Project details now surface through real Leaflet popups anchored
              to each pin — click a marker on the map. */}
          <MapPanel
            center={BHOPAL_CENTRE}
            zoom={10}
            pins={bhopalMapPins}
            heatZones={bhopalHeatZones}
            activePinId="1"
          />
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-800">Selected Project</p>
              <button className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-16 h-14 rounded-lg bg-slate-100 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">{bhopalSelectedProject.name}</p>
                <Badge color="blue" className="mt-1">
                  {bhopalSelectedProject.status}
                </Badge>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-1">{bhopalSelectedProject.code}</p>
            <p className="text-[11px] text-slate-500 mb-1 flex items-center gap-1">
              <MapPinIcon size={11} /> {bhopalSelectedProject.constituency.split(",")[0]}, Bhopal, MP
            </p>
            <p className="text-[11px] text-slate-500 mb-3">🏢 {bhopalSelectedProject.agency}</p>
            <p className="text-[11px] text-slate-500 mb-3">
              Start: 12 Jan 2023 · Expected: 31 Dec 2024
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg bg-red-50 p-2">
                <p className="text-[10px] text-slate-500">AI Health Score</p>
                <p className="text-base font-bold text-red-600">
                  {bhopalSelectedProject.aiHealthScore} / 100
                </p>
                <p className="text-[10px] text-red-500">High Risk</p>
              </div>
              <div className="rounded-lg bg-red-50 p-2">
                <p className="text-[10px] text-slate-500">Delay Probability</p>
                <p className="text-base font-bold text-red-600">{bhopalSelectedProject.delayProbabilityPct}%</p>
                <p className="text-[10px] text-red-500">Likely to be delayed</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Financial Progress</p>
                <p className="text-sm font-bold text-slate-800">{bhopalSelectedProject.financialProgressPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Physical Progress</p>
                <p className="text-sm font-bold text-slate-800">{bhopalSelectedProject.physicalProgressPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Predicted Delay</p>
                <p className="text-sm font-bold text-slate-800">{bhopalSelectedProject.predictedDelayDays} days</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Pending Approvals</p>
                <p className="text-sm font-bold text-slate-800">{bhopalSelectedProject.pendingApprovals}</p>
              </div>
            </div>

            <Link
              href={`/projects/${bhopalSelectedProject.id}`}
              className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700"
            >
              View Detailed Analysis <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">Nearby Projects ({bhopalNearbyProjects.length})</p>
              <Link className="link-muted" href="/projects">
                View All →
              </Link>
            </div>
            <div className="space-y-2.5">
              {bhopalNearbyProjects.map((p) => (
                <div key={p.code} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {p.location} · {p.code}
                    </p>
                  </div>
                  <Badge color={riskBadgeColor(p.aiScore)}>{p.aiScore}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 flex items-start gap-3">
          <Target size={18} className="text-red-500 mt-0.5" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Risk Hotspots</p>
            <p className="text-base font-bold text-red-600">{bhopalRiskHotspots.count} major hotspots</p>
            <p className="text-[11px] text-slate-500">{bhopalRiskHotspots.label}</p>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Underserved Areas</p>
            <p className="text-base font-bold text-amber-600">{bhopalUnderservedAreas.count} key areas</p>
            <p className="text-[11px] text-slate-500">{bhopalUnderservedAreas.label}</p>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <Users size={18} className="text-purple-500 mt-0.5" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Agency Clusters</p>
            <p className="text-base font-bold text-purple-600">{bhopalAgencyClusters.count} agencies</p>
            <p className="text-[11px] text-slate-500">{bhopalAgencyClusters.label}</p>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <TrendingUp size={18} className="text-emerald-500 mt-0.5" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Project Density</p>
            <p className="text-base font-bold text-emerald-600">{bhopalProjectDensity.label}</p>
            <p className="text-[11px] text-slate-500">{bhopalProjectDensity.note}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
