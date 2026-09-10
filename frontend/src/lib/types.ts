// Shared domain types for the MPLADS AI Monitoring & Audit Intelligence dashboard.
// These mirror the shape the real Backend API (FastAPI + PostgreSQL/PostGIS) is
// expected to return - see /backend for the service skeleton.

export type ProjectStatus =
  | "Completed"
  | "In Progress"
  | "Delayed"
  | "Not Started"
  | "High Risk";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Project {
  id: string;
  code: string; // e.g. MPLADS/2023/001
  name: string;
  sector:
    | "Roads & Transport"
    | "Drinking Water"
    | "Sanitation"
    | "Healthcare"
    | "Education"
    | "Community Infrastructure"
    | "Others";
  constituency: string;
  state: string;
  district: string;
  location: GeoPoint;
  agency: string;
  status: ProjectStatus;
  riskLevel: RiskLevel;
  aiScore: number; // 0-100, higher = higher risk in list views, or health in detail view
  aiHealthScore: number; // 0-100
  delayProbabilityPct: number;
  predictedDelayDays: number;
  financialProgressPct: number;
  physicalProgressPct: number;
  sanctionedAmountCr: number;
  releasedAmountCr: number;
  expenditureCr: number;
  timelineAdherencePct: number;
  pendingApprovals: number;
  updateConsistencyPct: number;
  startDate: string;
  expectedEndDate: string;
  imageUrl?: string;
}

export interface Agency {
  id: string;
  name: string;
  projectsCount: number;
  completionRatePct: number;
  avgDelayDays: number;
  costVariationPct: number;
  stalledProjects: number;
  updateConsistencyPct: number;
  aiScore: number;
}

export interface SectorGap {
  sector: string;
  needScore: number; // 0-100, estimated need
  coveredScore: number; // 0-100, project coverage
  gapPct: number;
  gapLevel: "Low" | "Medium" | "High";
  need: number;
  covered: number;
}

export interface WardGap {
  rank: number;
  area: string;
  block: string;
  gapSector: string;
  needLevel: "Low" | "Medium" | "High";
}

export interface ConstituencyTrendPoint {
  year: string;
  fundsReleasedCr: number;
  expenditureCr: number;
  avgPhysicalProgressPct: number;
  projects?: number;
  cumulativeAllocationCr?: number;
}

export interface Recommendation {
  id: string;
  priority: number;
  title: string;
  description: string;
  type: "High Gap" | "Medium Gap" | "Monitoring" | "Convergence";
}

export interface AnomalyFlag {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
}
