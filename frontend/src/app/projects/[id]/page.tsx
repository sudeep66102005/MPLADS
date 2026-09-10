import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProjectRadarChart } from "@/components/charts/ProjectRadarChart";
import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart";
import {
  MapPin,
  Calendar,
  Building2,
  Eye,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import {
  bhopalSelectedProject,
  projectAiInsights,
  projectFinancialTrend,
  projectPhotos,
  projectRadar,
  projectRiskIndicators,
  projectDetailTimeline,
  agencyContribution,
  sectorGapAnalysis
} from "@/lib/mockData";

const tabs = [
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

const analysisTabs = ["Overall", "Financial", "Physical", "Timeline", "Approvals", "Anomalies", "Agency"];

const timelineStatusIcon: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  Completed: { icon: CheckCircle2, color: "text-emerald-500" },
  "In Progress": { icon: Clock, color: "text-blue-500" },
  Delayed: { icon: AlertTriangle, color: "text-amber-500" },
  Pending: { icon: Info, color: "text-slate-400" }
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = bhopalSelectedProject; // In a real app: fetch by params.id from the backend API
  const agency = agencyContribution[0];

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.name }]}
        title={project.name}
        subtitle={undefined}
        right={
          <>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              <Eye size={15} /> View on Map
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              <Download size={15} /> Download Report
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg px-3.5 py-2 hover:bg-blue-700">
              <Plus size={15} /> Add Note
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4 -mt-2">
        <Badge color="blue">{project.status}</Badge>
        <span className="font-medium text-slate-600">{project.code}</span>
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {project.constituency}
        </span>
        <span className="flex items-center gap-1">
          <Building2 size={12} /> {project.agency}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> Start: 12 Jan 2023 · Expected: 31 Dec 2024 (378 days left)
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-5 border-b border-slate-200 mb-4 overflow-x-auto">
        {tabs.map((t, idx) => (
          <button
            key={t}
            className={
              idx === 0
                ? "text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 whitespace-nowrap"
                : "text-sm font-medium text-slate-500 pb-2 whitespace-nowrap hover:text-slate-700"
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* Score strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">AI Health Score</p>
          <p className="text-xl font-bold text-red-600">{project.aiHealthScore} / 100</p>
          <Badge color="red">High Risk</Badge>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Delay Probability</p>
          <p className="text-xl font-bold text-red-600">{project.delayProbabilityPct}%</p>
          <p className="text-[11px] text-red-500">Likely to be delayed</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Financial Progress</p>
          <p className="text-xl font-bold text-emerald-600 mb-1">{project.financialProgressPct}%</p>
          <ProgressBar value={project.financialProgressPct} color="bg-emerald-500" />
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Physical Progress</p>
          <p className="text-xl font-bold text-blue-600 mb-1">{project.physicalProgressPct}%</p>
          <ProgressBar value={project.physicalProgressPct} color="bg-blue-500" />
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Timeline Adherence</p>
          <p className="text-xl font-bold text-amber-600 mb-1">{project.timelineAdherencePct}%</p>
          <ProgressBar value={project.timelineAdherencePct} color="bg-amber-500" />
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Pending Approvals</p>
          <p className="text-xl font-bold text-slate-800">{project.pendingApprovals}</p>
          <p className="text-[11px] text-amber-600">Require attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-4 mb-4">
        <div className="card p-4">
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3 mb-3">
            <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 leading-relaxed">
              This project is at high risk due to slow physical progress, higher than expected expenditure and
              delayed milestones.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-2">AI Analysis Summary</p>
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Key Findings</p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {projectAiInsights.slice(0, 2).map((insight, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                {insight}
              </li>
            ))}
            <li className="flex items-start gap-1.5">
              <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
              {projectAiInsights[2]}
            </li>
            <li className="flex items-start gap-1.5">
              <Info size={12} className="text-slate-400 mt-0.5 shrink-0" />
              3 pending approvals (final measurement, utilisation certificate, occupancy)
            </li>
            <li className="flex items-start gap-1.5">
              <Info size={12} className="text-slate-400 mt-0.5 shrink-0" />
              {projectAiInsights[3]}
            </li>
          </ul>
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Detailed AI Analysis</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2 overflow-x-auto">
            {analysisTabs.map((t, idx) => (
              <span
                key={t}
                className={idx === 0 ? "text-blue-600 font-semibold" : "hover:text-slate-600 cursor-pointer"}
              >
                {t}
              </span>
            ))}
          </div>
          <ProjectRadarChart data={projectRadar} />
          <p className="text-xs font-semibold text-slate-700 mt-2 mb-1.5">AI Insights</p>
          <ul className="space-y-1.5 text-[11px] text-slate-600">
            <li className="flex items-start gap-1.5">
              <AlertTriangle size={11} className="text-red-500 mt-0.5 shrink-0" />
              High expenditure (82%) but low physical progress (48%).
            </li>
            <li className="flex items-start gap-1.5">
              <AlertTriangle size={11} className="text-red-500 mt-0.5 shrink-0" />
              Timeline slippage detected based on current trend.
            </li>
            <li className="flex items-start gap-1.5">
              <Info size={11} className="text-blue-500 mt-0.5 shrink-0" />
              Last update was 45 days ago.
            </li>
            <li className="flex items-start gap-1.5">
              <Info size={11} className="text-blue-500 mt-0.5 shrink-0" />
              Similar projects by this agency average delay of 62 days.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">Project Location</p>
            <div className="h-32 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs relative overflow-hidden">
              <MapPin size={22} className="text-red-500" />
            </div>
            <a href="/map" className="link-muted flex justify-end mt-2">
              View on Map ⤢
            </a>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-800">Risk Indicators &amp; Anomalies</p>
              <Badge color="red">4 High Risk</Badge>
            </div>
            <div className="space-y-2.5">
              {projectRiskIndicators.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle
                      size={12}
                      className={`${r.severity === "High" ? "text-red-500" : "text-amber-500"} mt-0.5 shrink-0`}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">{r.title}</p>
                      <p className="text-[10px] text-slate-500">{r.detail}</p>
                    </div>
                  </div>
                  <a className="link-muted shrink-0" href="#">
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-1">Financial Analysis</p>
          <div className="grid grid-cols-3 gap-2 mb-2 text-center">
            <div>
              <p className="text-[10px] text-slate-400">Sanctioned Amount</p>
              <p className="text-sm font-bold text-slate-800">₹{project.sanctionedAmountCr.toFixed(2)} Cr</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Released Amount</p>
              <p className="text-sm font-bold text-slate-800">
                ₹{project.releasedAmountCr.toFixed(2)} Cr ({project.financialProgressPct}%)
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Expenditure</p>
              <p className="text-sm font-bold text-slate-800">
                ₹{project.expenditureCr.toFixed(2)} Cr ({Math.round((project.expenditureCr / project.sanctionedAmountCr) * 100)}%)
              </p>
            </div>
          </div>
          <FinancialAreaChart data={projectFinancialTrend} />
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">Physical Progress</p>
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-slate-500">Current Progress</span>
            <span className="font-semibold text-slate-800">{project.physicalProgressPct}%</span>
          </div>
          <ProgressBar value={project.physicalProgressPct} color="bg-blue-500" />
          <div className="flex items-center justify-between mt-2 mb-1 text-xs">
            <span className="text-slate-500">Expected Progress</span>
            <span className="font-semibold text-slate-800">70%</span>
          </div>
          <ProgressBar value={70} color="bg-slate-300" />

          <p className="text-xs font-semibold text-slate-700 mt-3 mb-2">Photos</p>
          <div className="grid grid-cols-4 gap-1.5">
            {projectPhotos.map((p, idx) => (
              <div key={idx} className="aspect-square rounded-md bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                {p.date}
              </div>
            ))}
          </div>
          <a href="#" className="link-muted flex justify-end mt-2">
            View All Photos →
          </a>
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-3">Timeline &amp; Milestones</p>
          <div className="space-y-3">
            {projectDetailTimeline.map((step, idx) => {
              const conf = timelineStatusIcon[step.status];
              const Icon = conf.icon;
              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <Icon size={15} className={`${conf.color} mt-0.5 shrink-0`} />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{step.label}</p>
                      <p className="text-[10px] text-slate-400">{step.date}</p>
                    </div>
                    <Badge
                      color={
                        step.status === "Completed"
                          ? "emerald"
                          : step.status === "In Progress"
                          ? "blue"
                          : step.status === "Delayed"
                          ? "amber"
                          : "slate"
                      }
                    >
                      {step.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <a href="#" className="link-muted flex justify-end mt-2">
            View Full Timeline →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Agency Performance ({project.agency})</p>
            <a className="link-muted" href="/agency-performance">
              View Agency Details →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[10px] text-slate-400">Project Completion Rate</p>
              <p className="text-base font-bold text-slate-800">{agency.completionRatePct}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Average Delay</p>
              <p className="text-base font-bold text-slate-800">{agency.avgDelayDays} days</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Cost Variation</p>
              <p className="text-base font-bold text-amber-600">+{agency.costVariationPct}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Stalled Projects</p>
              <p className="text-base font-bold text-red-600">
                {agency.stalledProjects} / {agency.projectsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800 mb-3">Constituency Development Gap Analysis</p>
          <div className="grid grid-cols-2 gap-2">
            {sectorGapAnalysis.slice(0, 4).map((s) => (
              <div key={s.sector} className="border border-slate-100 rounded-lg p-2">
                <p className="text-[10px] font-medium text-slate-600 truncate">{s.sector}</p>
                <Badge color={s.gapLevel === "High" ? "red" : s.gapLevel === "Medium" ? "amber" : "emerald"}>
                  {s.gapLevel} Gap
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={15} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-800">AI Prediction</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-100 p-3">
            <p className="text-xs text-red-700 leading-relaxed">
              Likely to be delayed by {Math.round(project.predictedDelayDays / 30)}-
              {Math.round(project.predictedDelayDays / 30) + 1} months. Predicted completion: May 2025 (≈{" "}
              {project.predictedDelayDays} days).
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
