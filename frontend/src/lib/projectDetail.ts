import type { Project } from "./types";
import { projects } from "./mockData";

/**
 * Project Analysis (detail) page data.
 *
 * The page layout is identical for every project; only the values differ.
 * Project "1" (Construction of Community Hall) has an explicit override so it
 * reproduces the reference mockup exactly, field for field. Every other demo
 * project gets the same structure derived from its own base numbers, so all 10
 * render a complete, self-consistent page.
 *
 * A fixed "as of" date is used instead of `new Date()` so static export stays
 * deterministic (a build today and a build next week produce identical HTML).
 */
export const AS_OF = new Date("2024-12-14T00:00:00Z");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export type MilestoneStatus = "Completed" | "Delayed" | "In Progress" | "Pending";
export type Tone = "red" | "amber" | "blue" | "slate";
export type GapLevel = "High Gap" | "Medium Gap" | "Low Gap";

export interface Milestone {
  label: string;
  date: string;
  /** Prefix shown before the date, e.g. "Expected:" for future milestones. */
  datePrefix?: string;
  status: MilestoneStatus;
}

export interface RiskIndicator {
  title: string;
  detail: string;
  severity: "High" | "Medium";
}

export interface AgencySnapshot {
  name: string;
  completionRatePct: number;
  avgDelayDays: number;
  costVariationPct: number;
  stalledProjects: number;
  totalProjects: number;
  updateConsistencyPct: number;
}

export interface ProjectDetail {
  alertSummary: string;
  keyFindings: { text: string; tone: Tone }[];
  radar: { metric: string; value: number }[];
  aiInsights: { text: string; tone: Tone }[];
  financial: {
    sanctionedCr: number;
    releasedCr: number;
    releasedPct: number;
    expenditureCr: number;
    expenditurePct: number;
    trend: { quarter: string; cumulative: number; expected: number }[];
  };
  physical: { currentPct: number; expectedPct: number; photoDates: string[] };
  timeline: Milestone[];
  riskIndicators: RiskIndicator[];
  highRiskCount: number;
  agency: AgencySnapshot;
  gapAnalysis: { sector: string; level: GapLevel }[];
  prediction: { headline: string; detail: string };
  daysLeft: number;
}

/**
 * Agency-level stats as shown on the detail page.
 *
 * NOTE: these intentionally differ from `topAgencies` (dashboard) and
 * `agencyContribution` (constituency insights) — the three reference mockups
 * quote different figures for the same agency. Each page is kept faithful to
 * its own mockup rather than silently reconciling them.
 */
const AGENCY_SNAPSHOTS: Record<string, Omit<AgencySnapshot, "name">> = {
  "Rural Development Dept.": {
    completionRatePct: 68,
    avgDelayDays: 62,
    costVariationPct: 18,
    stalledProjects: 7,
    totalProjects: 36,
    updateConsistencyPct: 54
  },
  "Public Works Dept.": {
    completionRatePct: 74,
    avgDelayDays: 48,
    costVariationPct: 12,
    stalledProjects: 5,
    totalProjects: 42,
    updateConsistencyPct: 66
  },
  "Water Resources Dept.": {
    completionRatePct: 58,
    avgDelayDays: 71,
    costVariationPct: 22,
    stalledProjects: 9,
    totalProjects: 28,
    updateConsistencyPct: 47
  },
  "Education Dept.": {
    completionRatePct: 88,
    avgDelayDays: 21,
    costVariationPct: 6,
    stalledProjects: 2,
    totalProjects: 22,
    updateConsistencyPct: 81
  },
  "Health Dept.": {
    completionRatePct: 91,
    avgDelayDays: 14,
    costVariationPct: 4,
    stalledProjects: 1,
    totalProjects: 18,
    updateConsistencyPct: 88
  },
  "Urban Dev. Dept.": {
    completionRatePct: 52,
    avgDelayDays: 86,
    costVariationPct: 26,
    stalledProjects: 8,
    totalProjects: 24,
    updateConsistencyPct: 41
  },
  "Women & Child Dev. Dept.": {
    completionRatePct: 76,
    avgDelayDays: 33,
    costVariationPct: 9,
    stalledProjects: 3,
    totalProjects: 16,
    updateConsistencyPct: 69
  },
  "Municipal Corporation": {
    completionRatePct: 80,
    avgDelayDays: 29,
    costVariationPct: 7,
    stalledProjects: 2,
    totalProjects: 14,
    updateConsistencyPct: 73
  }
};

function agencyFor(name: string): AgencySnapshot {
  const snapshot =
    AGENCY_SNAPSHOTS[name] ?? {
      completionRatePct: 70,
      avgDelayDays: 40,
      costVariationPct: 12,
      stalledProjects: 4,
      totalProjects: 20,
      updateConsistencyPct: 62
    };
  return { name, ...snapshot };
}

/** Constituency-level gap tiles — same for every project in the constituency. */
const GAP_ANALYSIS: { sector: string; level: GapLevel }[] = [
  { sector: "Drinking Water", level: "High Gap" },
  { sector: "Healthcare", level: "Medium Gap" },
  { sector: "Education", level: "Low Gap" },
  { sector: "Sanitation", level: "High Gap" }
];

/** Eight quarters of cumulative spend, easing toward the actual expenditure. */
function buildFinancialTrend(sanctionedCr: number, expenditureCr: number) {
  const quarters = [
    "Q1 2023",
    "Q2 2023",
    "Q3 2023",
    "Q4 2023",
    "Q1 2024",
    "Q2 2024",
    "Q3 2024",
    "Q4 2024"
  ];
  return quarters.map((quarter, i) => {
    const t = (i + 1) / quarters.length;
    // Mild S-curve: slow start, steady middle, tapering end.
    const eased = Math.pow(t, 1.35);
    return {
      quarter,
      cumulative: Math.round(expenditureCr * eased * 10) / 10,
      expected: Math.round(sanctionedCr * t * 10) / 10
    };
  });
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Six standard MPLADS milestones spread across the project window. */
function buildTimeline(project: Project): Milestone[] {
  const start = new Date(project.startDate);
  const end = new Date(project.expectedEndDate);
  const span = end.getTime() - start.getTime();
  const at = (fraction: number) => new Date(start.getTime() + span * fraction);

  const labels = [
    "Project Sanctioned",
    "Work Order Issued",
    "Foundation Completed",
    "Structure Work",
    "Finishing Work",
    "Project Completion"
  ];
  const fractions = [0, 0.08, 0.3, 0.45, 0.72, 1];

  // Milestones are marked complete in proportion to reported physical progress.
  const completedCount = Math.min(
    labels.length,
    Math.max(1, Math.round((project.physicalProgressPct / 100) * labels.length))
  );

  return labels.map((label, i) => {
    const date = at(fractions[i]);
    const isPast = date.getTime() <= AS_OF.getTime();
    let status: MilestoneStatus;

    if (i < completedCount) {
      status = "Completed";
    } else if (isPast) {
      // Should have happened by now but hasn't.
      status = i === completedCount ? "Delayed" : "In Progress";
    } else {
      status = i === completedCount ? "In Progress" : "Pending";
    }

    return {
      label,
      date: formatDate(date),
      datePrefix: status === "Completed" ? undefined : "Expected:",
      status
    };
  });
}

function buildRiskIndicators(project: Project): RiskIndicator[] {
  const out: RiskIndicator[] = [];
  const spendGap = project.financialProgressPct - project.physicalProgressPct;
  const agency = agencyFor(project.agency);

  if (spendGap > 20) {
    out.push({
      title: "Unexpected spending jumps",
      detail: `${Math.round(spendGap)}% of expenditure in last 2 months`,
      severity: "High"
    });
  }
  if (project.updateConsistencyPct < 60) {
    out.push({
      title: "Stalled project risk",
      detail: "No significant progress in last 45 days",
      severity: "High"
    });
  }
  if (agency.costVariationPct >= 15) {
    out.push({
      title: "Unusual cost variation",
      detail: `Material cost ${agency.costVariationPct + 17}% higher than similar projects`,
      severity: "High"
    });
  }
  if (project.physicalProgressPct > 10) {
    out.push({
      title: "Sudden progress claims",
      detail: "Reported 20% progress in 10 days",
      severity: "Medium"
    });
  }
  if (project.updateConsistencyPct < 70) {
    out.push({
      title: "Long periods without updates",
      detail: "No field updates for 45 days",
      severity: "Medium"
    });
  }

  return out;
}

/** Image-exact values for the project shown in the reference mockup. */
const OVERRIDES: Record<string, Partial<ProjectDetail>> = {
  "1": {
    alertSummary:
      "This project is at high risk due to slow physical progress, higher than expected expenditure and delayed milestones.",
    keyFindings: [
      { text: "Progress is 48% but 82% of funds have been spent", tone: "red" },
      { text: "Likely to be delayed by ~4-5 months", tone: "red" },
      { text: "Unusual spending pattern detected in Q2 2024", tone: "amber" },
      {
        text: "3 pending approvals (final measurement, utilisation certificate, occupancy)",
        tone: "amber"
      },
      { text: "No updates for 45 days (Jun 2024 – Aug 2024)", tone: "red" }
    ],
    radar: [
      { metric: "Financial Progress", value: 82 },
      { metric: "Physical Progress", value: 48 },
      { metric: "Timeline Adherence", value: 40 },
      { metric: "Update Consistency", value: 50 },
      { metric: "Expenditure Pattern", value: 35 },
      { metric: "Pending Approvals", value: 60 }
    ],
    aiInsights: [
      { text: "High expenditure (82%) but low physical progress (48%)", tone: "red" },
      { text: "Timeline slippage detected based on current trend", tone: "red" },
      { text: "Spending rate is 2.3x higher than comparable projects", tone: "amber" },
      { text: "Last update was 45 days ago", tone: "blue" },
      { text: "Similar projects by this agency have average delay of 62 days", tone: "blue" }
    ],
    physical: {
      currentPct: 48,
      expectedPct: 70,
      photoDates: ["12 Jun 2024", "18 Mar 2024", "25 May 2024", "10 Aug 2024"]
    },
    timeline: [
      { label: "Project Sanctioned", date: "12 Jan 2023", status: "Completed" },
      { label: "Work Order Issued", date: "15 Feb 2023", status: "Completed" },
      { label: "Foundation Completed", date: "20 Jun 2023", status: "Completed" },
      { label: "Structure Work", date: "30 Sep 2023", datePrefix: "Expected:", status: "Delayed" },
      { label: "Finishing Work", date: "31 Mar 2024", datePrefix: "Expected:", status: "In Progress" },
      { label: "Project Completion", date: "31 Dec 2024", datePrefix: "Expected:", status: "Pending" }
    ],
    riskIndicators: [
      {
        title: "Unexpected spending jumps",
        detail: "40% of expenditure in last 2 months",
        severity: "High"
      },
      {
        title: "Stalled project risk",
        detail: "No significant progress in last 45 days",
        severity: "High"
      },
      {
        title: "Unusual cost variation",
        detail: "Material cost 35% higher than similar projects",
        severity: "High"
      },
      {
        title: "Sudden progress claims",
        detail: "Reported 20% progress in 10 days",
        severity: "Medium"
      },
      {
        title: "Long periods without updates",
        detail: "No field updates for 45 days",
        severity: "Medium"
      }
    ],
    highRiskCount: 4,
    prediction: {
      headline: "Likely to be delayed by 4–5 months",
      detail: "Predicted completion: May 2025 (≈ 150 days delay)"
    }
  }
};

function derive(project: Project): ProjectDetail {
  const spendGap = project.financialProgressPct - project.physicalProgressPct;
  const agency = agencyFor(project.agency);
  const expectedPct = Math.min(95, project.physicalProgressPct + Math.max(8, Math.round(spendGap)));
  const delayMonths = Math.max(1, Math.round(project.predictedDelayDays / 30));

  const keyFindings: { text: string; tone: Tone }[] = [
    {
      text: `Progress is ${project.physicalProgressPct}% but ${project.financialProgressPct}% of funds have been spent`,
      tone: spendGap > 20 ? "red" : "amber"
    },
    {
      text:
        project.predictedDelayDays > 0
          ? `Likely to be delayed by ~${delayMonths} month${delayMonths > 1 ? "s" : ""}`
          : "Currently tracking on schedule",
      tone: project.predictedDelayDays > 45 ? "red" : "amber"
    },
    {
      text:
        project.pendingApprovals > 0
          ? `${project.pendingApprovals} pending approval${project.pendingApprovals > 1 ? "s" : ""} awaiting action`
          : "No pending approvals",
      tone: project.pendingApprovals >= 3 ? "amber" : "slate"
    },
    {
      text: `Update consistency at ${project.updateConsistencyPct}%`,
      tone: project.updateConsistencyPct < 55 ? "red" : "slate"
    }
  ];

  const aiInsights: { text: string; tone: Tone }[] = [
    {
      text: `High expenditure (${project.financialProgressPct}%) but low physical progress (${project.physicalProgressPct}%)`,
      tone: spendGap > 20 ? "red" : "blue"
    },
    {
      text:
        project.timelineAdherencePct < 60
          ? "Timeline slippage detected based on current trend"
          : "Timeline broadly on track",
      tone: project.timelineAdherencePct < 60 ? "red" : "blue"
    },
    { text: `Delay probability estimated at ${project.delayProbabilityPct}%`, tone: "amber" },
    {
      text: `Similar projects by this agency have average delay of ${agency.avgDelayDays} days`,
      tone: "blue"
    }
  ];

  return {
    alertSummary:
      project.riskLevel === "Low"
        ? "This project is tracking well against its financial and physical targets."
        : `This project is at ${project.riskLevel.toLowerCase()} risk due to the gap between expenditure and physical progress, and slipping milestones.`,
    keyFindings,
    radar: [
      { metric: "Financial Progress", value: project.financialProgressPct },
      { metric: "Physical Progress", value: project.physicalProgressPct },
      { metric: "Timeline Adherence", value: project.timelineAdherencePct },
      { metric: "Update Consistency", value: project.updateConsistencyPct },
      { metric: "Expenditure Pattern", value: Math.max(10, 100 - Math.round(spendGap * 1.9)) },
      { metric: "Pending Approvals", value: Math.max(10, 100 - project.pendingApprovals * 13) }
    ],
    aiInsights,
    financial: {
      sanctionedCr: project.sanctionedAmountCr,
      releasedCr: project.releasedAmountCr,
      releasedPct: Math.round((project.releasedAmountCr / project.sanctionedAmountCr) * 100),
      expenditureCr: project.expenditureCr,
      expenditurePct: Math.round((project.expenditureCr / project.sanctionedAmountCr) * 100),
      trend: buildFinancialTrend(project.sanctionedAmountCr, project.expenditureCr)
    },
    physical: {
      currentPct: project.physicalProgressPct,
      expectedPct,
      photoDates: ["12 Mar 2024", "28 May 2024", "14 Aug 2024", "02 Nov 2024"]
    },
    timeline: buildTimeline(project),
    riskIndicators: buildRiskIndicators(project),
    highRiskCount: buildRiskIndicators(project).filter((r) => r.severity === "High").length,
    agency,
    gapAnalysis: GAP_ANALYSIS,
    prediction:
      project.predictedDelayDays > 0
        ? {
            headline: `Likely to be delayed by ${delayMonths}–${delayMonths + 1} months`,
            detail: `Predicted completion: shifted by ≈ ${project.predictedDelayDays} days`
          }
        : {
            headline: "On track for on-time completion",
            detail: "No significant delay predicted at current pace"
          },
    daysLeft: Math.max(0, daysBetween(AS_OF, new Date(project.expectedEndDate)))
  };
}

export function getProjectDetail(project: Project): ProjectDetail {
  return { ...derive(project), ...OVERRIDES[project.id] };
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
