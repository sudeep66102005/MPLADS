import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Building2,
  Calendar,
  ArrowLeft,
  Map as MapIcon,
  Download,
  Plus,
  Activity,
  Clock,
  CheckCircle2,
  Hammer,
  FolderClock,
  FileWarning,
  AlertTriangle,
  Info,
  ArrowRight,
  Images,
  Maximize2,
  CircleDot
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MapPanel } from "@/components/map/MapPanel";
import { AnalysisRadarChart } from "@/components/charts/AnalysisRadarChart";
import { ExpenditureChart } from "@/components/charts/ExpenditureChart";
import { classNames } from "@/lib/format";
import { projects } from "@/lib/mockData";
import { getProjectById, getProjectDetail, formatDate } from "@/lib/projectDetail";
import type { GapLevel, MilestoneStatus, Tone } from "@/lib/projectDetail";

/** One static page per demo project, so all 10 are prerendered. */
export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

const TABS = [
  "Overview",
  "AI Analysis",
  "Financials",
  "Physical Progress",
  "Timeline & Milestones",
  "Photos",
  "Documents",
  "Inspection History",
  "Agency Details"
];

const ANALYSIS_TABS = [
  "Overall",
  "Financial",
  "Physical",
  "Timeline",
  "Approvals",
  "Anomalies",
  "Agency"
];

const toneText: Record<Tone, string> = {
  red: "text-red-500",
  amber: "text-amber-500",
  blue: "text-blue-500",
  slate: "text-slate-400"
};

const milestoneStyles: Record<MilestoneStatus, { pill: string; icon: string }> = {
  Completed: { pill: "bg-emerald-50 text-emerald-700", icon: "text-emerald-500" },
  Delayed: { pill: "bg-red-50 text-red-600", icon: "text-red-500" },
  "In Progress": { pill: "bg-blue-50 text-blue-700", icon: "text-blue-500" },
  Pending: { pill: "bg-slate-100 text-slate-500", icon: "text-slate-300" }
};

const gapStyles: Record<GapLevel, string> = {
  "High Gap": "text-red-600",
  "Medium Gap": "text-amber-600",
  "Low Gap": "text-emerald-600"
};

const gapTileBg: Record<string, string> = {
  "Drinking Water": "bg-blue-50/70",
  Healthcare: "bg-red-50/70",
  Education: "bg-emerald-50/70",
  Sanitation: "bg-amber-50/70"
};

/** Small stat card used across the score strip. */
function ScoreCard({
  label,
  value,
  sub,
  subClass,
  icon: Icon,
  tint,
  accent,
  bar
}: {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  icon: typeof Activity;
  tint: string;
  accent: string;
  bar?: { value: number; color: string };
}) {
  return (
    <div className={classNames("rounded-xl border p-3", tint)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-slate-500 truncate">{label}</p>
          <p className={classNames("text-[21px] font-bold leading-tight", accent)}>{value}</p>
          {sub ? (
            <p className={classNames("text-[10px] font-medium", subClass ?? "text-slate-500")}>{sub}</p>
          ) : null}
        </div>
        <span className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center shrink-0">
          <Icon size={14} className={accent} />
        </span>
      </div>
      {bar ? (
        <div className="mt-1.5">
          <ProgressBar value={bar.value} color={bar.color} height={5} />
        </div>
      ) : null}
    </div>
  );
}

export default function ProjectAnalysisPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);
  if (!project) notFound();

  const d = getProjectDetail(project);

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
        <Link href="/projects" className="hover:text-blue-600">
          Projects
        </Link>
        <span>›</span>
        <span className="text-slate-600 font-medium">{project.name}</span>
        <Link
          href="/projects"
          className="ml-2 inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
        >
          <ArrowLeft size={11} /> Back to Projects
        </Link>
      </div>

      {/* Title block */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Cover image placeholder — no licensed project photography available */}
          <div className="w-[92px] h-[62px] rounded-lg bg-slate-200 shrink-0 flex items-center justify-center">
            <Images size={18} className="text-slate-400" />
          </div>

          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
              {project.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11.5px] font-medium text-slate-500">{project.code}</span>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">
                {project.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                {project.district}, {project.state}
              </span>
              <span className="flex items-center gap-1">
                <Building2 size={11} className="text-slate-400" />
                {project.agency}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} className="text-slate-400" />
                Start: {formatDate(project.startDate)}
              </span>
              <span>
                Expected: {formatDate(project.expectedEndDate)}{" "}
                <span className="text-slate-400">({d.daysLeft} days left)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            <MapIcon size={13} /> View on Map
          </Link>
          <button className="inline-flex items-center gap-1.5 text-[11.5px] font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
            <Download size={13} /> Download Report
          </button>
          <button className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700">
            <Plus size={13} /> Add Note
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-5 border-b border-slate-200 mb-3.5 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={classNames(
              "pb-2 text-[12px] whitespace-nowrap",
              i === 0
                ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                : "text-slate-500 font-medium hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Score strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 mb-3.5">
        <ScoreCard
          label="AI Health Score"
          value={`${project.aiHealthScore} / 100`}
          sub={`${project.riskLevel} Risk`}
          subClass="text-red-500"
          icon={Activity}
          tint="bg-red-50/70 border-red-100"
          accent="text-red-500"
        />
        <ScoreCard
          label="Delay Probability"
          value={`${project.delayProbabilityPct}%`}
          sub="Likely to be delayed"
          subClass="text-red-500"
          icon={Clock}
          tint="bg-red-50/70 border-red-100"
          accent="text-red-500"
        />
        <ScoreCard
          label="Financial Progress"
          value={`${project.financialProgressPct}%`}
          icon={CheckCircle2}
          tint="bg-emerald-50/70 border-emerald-100"
          accent="text-emerald-600"
          bar={{ value: project.financialProgressPct, color: "bg-emerald-500" }}
        />
        <ScoreCard
          label="Physical Progress"
          value={`${project.physicalProgressPct}%`}
          icon={Hammer}
          tint="bg-blue-50/70 border-blue-100"
          accent="text-blue-600"
          bar={{ value: project.physicalProgressPct, color: "bg-blue-500" }}
        />
        <ScoreCard
          label="Timeline Adherence"
          value={`${project.timelineAdherencePct}%`}
          icon={FolderClock}
          tint="bg-amber-50/70 border-amber-100"
          accent="text-amber-600"
          bar={{ value: project.timelineAdherencePct, color: "bg-amber-500" }}
        />
        <ScoreCard
          label="Pending Approvals"
          value={String(project.pendingApprovals)}
          sub="Require attention"
          subClass="text-amber-600"
          icon={FileWarning}
          tint="bg-amber-50/70 border-amber-100"
          accent="text-amber-600"
        />
      </div>

      {/* Row 2: AI summary | detailed analysis | location */}
      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_215px] gap-3.5 mb-3.5 items-start">
        <section className="card p-3.5">
          <h2 className="text-[12.5px] font-bold text-slate-800 mb-2">AI Analysis Summary</h2>

          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-2.5 mb-3">
            <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[10.5px] text-slate-700 leading-relaxed">{d.alertSummary}</p>
          </div>

          <h3 className="text-[11px] font-bold text-slate-700 mb-1.5">Key Findings</h3>
          <ul className="space-y-2">
            {d.keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-2">
                <CircleDot size={11} className={classNames("mt-0.5 shrink-0", toneText[finding.tone])} />
                <span className="text-[10.5px] text-slate-600 leading-snug">{finding.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-3.5">
          <h2 className="text-[12.5px] font-bold text-slate-800 mb-2">Detailed AI Analysis</h2>

          <div className="flex items-center gap-1 border-b border-slate-100 mb-2 overflow-x-auto">
            {ANALYSIS_TABS.map((tab, i) => (
              <button
                key={tab}
                className={classNames(
                  "px-2.5 pb-1.5 text-[10.5px] whitespace-nowrap",
                  i === 0
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_205px] gap-3 items-center">
            <AnalysisRadarChart data={d.radar} />

            <div>
              <h3 className="text-[11px] font-bold text-slate-700 mb-1.5">AI Insights</h3>
              <ul className="space-y-1.5">
                {d.aiInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CircleDot
                      size={9}
                      className={classNames("mt-[3px] shrink-0", toneText[insight.tone])}
                    />
                    <span className="text-[9.5px] text-slate-600 leading-snug">{insight.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Map retained here (map removal was scoped to the dashboard) */}
        <section className="card p-3.5">
          <h2 className="text-[12.5px] font-bold text-slate-800 mb-2">Project Location</h2>
          <MapPanel
            center={[project.location.lat, project.location.lng]}
            zoom={11}
            pins={[
              {
                id: project.id,
                lat: project.location.lat,
                lng: project.location.lng,
                status: project.status,
                label: project.name,
                code: project.code,
                aiScore: project.aiScore
              }
            ]}
            height={120}
            showBasemapToggle={false}
          />
          <Link href="/map" className="link-muted flex items-center justify-end gap-1 mt-2">
            View on Map <Maximize2 size={10} />
          </Link>
        </section>
      </div>

      {/* Row 3: financial | physical | timeline | risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_215px] gap-3.5 mb-3.5 items-start">
        <section className="card p-3.5">
          <h2 className="text-[12.5px] font-bold text-slate-800 mb-2">Financial Analysis</h2>
          <dl className="space-y-1 mb-2">
            <div className="flex items-center justify-between text-[10.5px]">
              <dt className="text-slate-500">Sanctioned Amount</dt>
              <dd className="font-bold text-slate-800">₹ {d.financial.sanctionedCr.toFixed(2)} Cr</dd>
            </div>
            <div className="flex items-center justify-between text-[10.5px]">
              <dt className="text-slate-500">Released Amount</dt>
              <dd className="font-bold text-slate-800">
                ₹ {d.financial.releasedCr.toFixed(2)} Cr ({d.financial.releasedPct}%)
              </dd>
            </div>
            <div className="flex items-center justify-between text-[10.5px]">
              <dt className="text-slate-500">Expenditure</dt>
              <dd className="font-bold text-slate-800">
                ₹ {d.financial.expenditureCr.toFixed(2)} Cr ({d.financial.expenditurePct}%)
              </dd>
            </div>
          </dl>

          <div className="flex items-center gap-3 mb-1 text-[9px]">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-sm bg-blue-500" /> Cumulative Expenditure
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 border-t border-dashed border-slate-400" /> Expected Expenditure
            </span>
          </div>
          <ExpenditureChart data={d.financial.trend} maxCr={d.financial.sanctionedCr} />
        </section>

        <section className="card p-3.5">
          <h2 className="text-[12.5px] font-bold text-slate-800 mb-2.5">Physical Progress</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5">Current Progress</p>
              <p className="text-[17px] font-bold text-blue-600 leading-none mb-1.5">
                {d.physical.currentPct}%
              </p>
              <ProgressBar value={d.physical.currentPct} color="bg-blue-500" height={6} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5">Expected Progress</p>
              <p className="text-[17px] font-bold text-slate-700 leading-none mb-1.5">
                {d.physical.expectedPct}%
              </p>
              <ProgressBar value={d.physical.expectedPct} color="bg-slate-300" height={6} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-1">
            {d.physical.photoDates.map((date) => (
              <div key={date} className="space-y-1">
                <div className="aspect-[4/3] rounded bg-slate-200 flex items-center justify-center">
                  <Images size={13} className="text-slate-400" />
                </div>
                <p className="text-[7.5px] text-slate-400 text-center leading-none">{date}</p>
              </div>
            ))}
          </div>

          <button className="w-full mt-2 inline-flex items-center justify-center gap-1 text-[10.5px] font-semibold border border-slate-200 rounded-lg py-1.5 text-slate-600 hover:bg-slate-50">
            View All Photos <ArrowRight size={11} />
          </button>
        </section>

        <section className="card p-3.5">
          <h2 className="text-[12.5px] font-bold text-slate-800 mb-2.5">Timeline &amp; Milestones</h2>
          <ol className="relative space-y-2.5">
            {d.timeline.map((m, i) => {
              const styles = milestoneStyles[m.status];
              const isLast = i === d.timeline.length - 1;
              return (
                <li key={m.label} className="relative flex items-start gap-2 pl-0">
                  <span className="relative flex flex-col items-center shrink-0">
                    <CheckCircle2 size={13} className={styles.icon} />
                    {!isLast ? <span className="w-px flex-1 min-h-[14px] bg-slate-200 mt-0.5" /> : null}
                  </span>
                  <div className="flex-1 flex items-start justify-between gap-2 -mt-0.5">
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-semibold text-slate-700 truncate">{m.label}</p>
                      <p className="text-[9px] text-slate-400">
                        {m.datePrefix ? `${m.datePrefix} ` : ""}
                        {m.date}
                      </p>
                    </div>
                    <span
                      className={classNames(
                        "text-[8.5px] font-semibold rounded px-1.5 py-0.5 shrink-0",
                        styles.pill
                      )}
                    >
                      {m.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link href="#" className="link-muted flex justify-end mt-2">
            View Full Timeline →
          </Link>
        </section>

        <section className="card p-3.5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[12.5px] font-bold text-slate-800">Risk Indicators</h2>
            <span className="text-[8.5px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 shrink-0">
              {d.highRiskCount} High Risk
            </span>
          </div>
          <ul className="space-y-2">
            {d.riskIndicators.map((risk) => (
              <li key={risk.title} className="flex items-start gap-1.5">
                <AlertTriangle
                  size={11}
                  className={classNames(
                    "mt-0.5 shrink-0",
                    risk.severity === "High" ? "text-red-500" : "text-amber-500"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-700 leading-snug">{risk.title}</p>
                  <p className="text-[8.5px] text-slate-400 leading-snug">{risk.detail}</p>
                </div>
                <button className="text-[9px] font-semibold text-blue-600 border border-slate-200 rounded px-1.5 py-0.5 shrink-0 hover:bg-slate-50">
                  View
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Row 4: agency | gaps | prediction */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_320px] gap-3.5">
        <section className="card p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12.5px] font-bold text-slate-800 truncate">
              Agency Performance ({d.agency.name})
            </h2>
            <Link href="/agency-performance" className="link-muted shrink-0">
              View Agency Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: "Project Completion Rate", value: `${d.agency.completionRatePct}%` },
              { label: "Average Delay", value: `${d.agency.avgDelayDays} days` },
              { label: "Cost Variation", value: `+${d.agency.costVariationPct}%` },
              { label: "Stalled Projects", value: `${d.agency.stalledProjects} / ${d.agency.totalProjects}` },
              { label: "Update Consistency", value: `${d.agency.updateConsistencyPct}%` }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[9px] text-slate-400 leading-tight mb-0.5">{stat.label}</p>
                <p className="text-[14px] font-bold text-slate-800">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12.5px] font-bold text-slate-800">
              Constituency Development Gap Analysis
            </h2>
            <Link href="/constituency-insights" className="link-muted shrink-0">
              View Full Analysis →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {d.gapAnalysis.map((gap) => (
              <div
                key={gap.sector}
                className={classNames("rounded-lg p-2", gapTileBg[gap.sector] ?? "bg-slate-50")}
              >
                <p className="text-[9.5px] font-medium text-slate-600 leading-tight">{gap.sector}</p>
                <p className={classNames("text-[10.5px] font-bold mt-0.5", gapStyles[gap.level])}>
                  {gap.level}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <h2 className="text-[12.5px] font-bold text-slate-800">AI Prediction</h2>
            <Info size={11} className="text-slate-300" />
          </div>
          <div className="rounded-lg bg-red-50 border border-red-100 p-2.5 flex items-start gap-2">
            <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10.5px] font-semibold text-red-700 leading-snug">
                {d.prediction.headline}
              </p>
              <p className="text-[9.5px] text-red-600/80 leading-snug mt-0.5">
                {d.prediction.detail}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
