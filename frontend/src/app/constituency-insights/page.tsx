import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, ExportButton } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { CoverageBarChart } from "@/components/charts/CoverageBarChart";
import { InvestmentTrendChart } from "@/components/charts/InvestmentTrendChart";
import { MapPanel } from "@/components/map/MapPanel";
import {
  Folder,
  IndianRupee,
  PieChart as PieIcon,
  Activity,
  BarChart3,
  AlertTriangle,
  ChevronDown,
  Lightbulb,
  Droplets,
  HeartPulse,
  Car,
  Building2
} from "lucide-react";
import {
  constituencyKeyInsight,
  constituencyKpis,
  constituencyRecommendations,
  coverageVsNeed,
  investmentProgressTrend,
  sectorGapAnalysis,
  agencyContribution,
  wardGaps,
  berasiaMapPins,
  berasiaHeatZones,
  BERASIA_CENTRE
} from "@/lib/mockData";

const gapLevelColor: Record<string, "red" | "amber" | "emerald"> = {
  High: "red",
  Medium: "amber",
  Low: "emerald"
};

const sectorIcon: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "Drinking Water": Droplets,
  Healthcare: HeartPulse,
  Sanitation: Activity,
  "Roads & Transport": Car,
  "Community Infrastructure": Building2,
  Education: Building2
};

export default function ConstituencyInsightsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Constituency Insights"
        subtitle="AI-powered analysis of development needs and project coverage"
        right={
          <>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              Berasia (Bhopal, MP)
              <ChevronDown size={14} />
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              Apr 2021 – Dec 2024
              <ChevronDown size={14} />
            </button>
            <ExportButton label="Export Report" />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard
          icon={Folder}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Projects"
          value={String(constituencyKpis.totalProjects)}
          subValue={`↑ ${constituencyKpis.totalProjectsYoY}% vs. last term`}
          subValueColor="text-emerald-600"
          trend
        />
        <KpiCard
          icon={IndianRupee}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Allocation"
          value={`₹ ${constituencyKpis.totalAllocationCr} Cr`}
        />
        <KpiCard
          icon={PieIcon}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Fund Utilization"
          value={`${constituencyKpis.fundUtilizationPct}%`}
          subValue={`₹${constituencyKpis.fundUtilizedCr} Cr utilized`}
        />
        <KpiCard
          icon={Activity}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Avg. AI Health Score"
          value={`${constituencyKpis.avgAiHealthScore} / 100`}
        />
        <KpiCard
          icon={BarChart3}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Development Gaps"
          value={String(constituencyKpis.developmentGaps)}
          subValue="Key sectors"
        />
        <KpiCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="High Risk Projects"
          value={String(constituencyKpis.highRiskProjects)}
          subValue="Need immediate attention"
          subValueColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Constituency Map &amp; Development Gaps</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Project Location
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Underserved Area (High Gap)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Underserved Area (Medium Gap)
            </span>
          </div>
          <MapPanel
            center={BERASIA_CENTRE}
            zoom={11}
            pins={berasiaMapPins}
            heatZones={berasiaHeatZones}
            height={300}
          />
          <a href="/map" className="link-muted flex justify-end mt-2">
            View Full Map ⤢
          </a>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Sector-wise Development Gap Analysis</p>
            <a className="link-muted" href="#">
              View Details →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sectorGapAnalysis.map((sector) => {
              const Icon = sectorIcon[sector.sector] ?? Building2;
              return (
                <div key={sector.sector} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} className="text-slate-500" />
                    <p className="text-xs font-semibold text-slate-700">{sector.sector}</p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      sector.gapLevel === "High"
                        ? "text-red-600"
                        : sector.gapLevel === "Medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {sector.gapPct}%
                  </p>
                  <Badge color={gapLevelColor[sector.gapLevel]} className="mb-1">
                    {sector.gapLevel} Gap
                  </Badge>
                  <p className="text-[11px] text-slate-500">
                    Need: {sector.need} · Covered: {sector.covered}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3 flex items-start gap-2">
            <Lightbulb size={15} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800 mb-0.5">Key Insight</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">{constituencyKeyInsight}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Project Coverage vs Estimated Need</p>
          <CoverageBarChart data={coverageVsNeed} />
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">District / Ward Level Underserved Areas</p>
            <a className="link-muted" href="#">
              View All →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-1.5 pr-2">#</th>
                  <th className="py-1.5 pr-2">Area / Ward</th>
                  <th className="py-1.5 pr-2">Block</th>
                  <th className="py-1.5 pr-2">Gap Sector</th>
                  <th className="py-1.5">Need Level</th>
                </tr>
              </thead>
              <tbody>
                {wardGaps.map((w) => (
                  <tr key={w.rank} className="border-b border-slate-50 last:border-0">
                    <td className="py-1.5 pr-2 text-slate-500">{w.rank}</td>
                    <td className="py-1.5 pr-2 font-medium text-slate-700">{w.area}</td>
                    <td className="py-1.5 pr-2 text-slate-500">{w.block}</td>
                    <td className="py-1.5 pr-2 text-slate-500">{w.gapSector}</td>
                    <td className="py-1.5">
                      <Badge color={gapLevelColor[w.needLevel]}>{w.needLevel}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Agency Contribution &amp; Performance</p>
            <a className="link-muted" href="/agency-performance">
              View Full Analysis →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-1.5 pr-2">Agency</th>
                  <th className="py-1.5 pr-2">Projects</th>
                  <th className="py-1.5 pr-2">Completion Rate</th>
                  <th className="py-1.5 pr-2">Avg. Delay</th>
                  <th className="py-1.5">AI Score</th>
                </tr>
              </thead>
              <tbody>
                {agencyContribution.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-1.5 pr-2 font-medium text-slate-700">{a.name}</td>
                    <td className="py-1.5 pr-2 text-slate-500">{a.projectsCount}</td>
                    <td className="py-1.5 pr-2 text-slate-500">{a.completionRatePct}%</td>
                    <td className="py-1.5 pr-2 text-slate-500">{a.avgDelayDays} days</td>
                    <td className="py-1.5">
                      <Badge color={a.aiScore >= 65 ? "emerald" : a.aiScore >= 50 ? "amber" : "red"}>
                        {a.aiScore}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Investment &amp; Progress Trend (Constituency Level)</p>
          <InvestmentTrendChart data={investmentProgressTrend} />
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Top Recommendations</p>
            <a className="link-muted" href="#">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            {constituencyRecommendations.map((rec) => (
              <div key={rec.id} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {rec.priority}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {rec.type} – {rec.title}
                  </p>
                  <p className="text-[11px] text-slate-500">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
