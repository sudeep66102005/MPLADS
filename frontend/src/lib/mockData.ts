import type {
  Agency,
  ConstituencyTrendPoint,
  Project,
  Recommendation,
  SectorGap,
  WardGap
} from "./types";
import type { GeoHeatZone, GeoPin } from "@/components/map/types";

// -----------------------------------------------------------------------------
// Mock data layer.
//
// This stands in for the real Backend API (Python / FastAPI + PostgreSQL/PostGIS)
// described in the system architecture. All numbers below are illustrative and
// were chosen to match the reference dashboard mockups (Bhopal / Madhya Pradesh
// constituency) so the UI can be built and demoed without a live backend.
// Swap `src/lib/api.ts` to call real endpoints once the backend
// (see /backend) is available.
// -----------------------------------------------------------------------------

export const currentUser = {
  name: "Shri Arjun Mehta",
  role: "Member of Parliament",
  avatarInitials: "AM"
};

export interface RegionOption {
  id: string;
  label: string;
  state: string;
}

export const regionOptions: RegionOption[] = [
  { id: "bhopal-mp", label: "Bhopal, Madhya Pradesh", state: "Madhya Pradesh" },
  { id: "berasia", label: "Berasia (Bhopal, MP)", state: "Madhya Pradesh" }
];

// ---- Bhopal, Madhya Pradesh dataset -----------------------------------------

export const bhopalKpis = {
  totalProjects: 182,
  totalProjectsYoY: 12,
  highRisk: 21,
  highRiskPct: 11.5,
  delayed: 21,
  delayedPct: 11.5,
  financialAnomalies: 14,
  financialAnomaliesPct: 7.7,
  developmentGaps: 8
};

export const bhopalRiskHotspots = { count: 3, label: "Berasia, Misrod, Neelbad" };
export const bhopalUnderservedAreas = { count: 4, label: "Low project coverage" };
export const bhopalAgencyClusters = { count: 12, label: "Active in this district" };
export const bhopalProjectDensity = { label: "High in urban blocks", note: "Low in rural blocks" };

export const bhopalSelectedProject: Project = {
  id: "mplads-2023-001",
  code: "MPLADS/2023/001",
  name: "Construction of Community Hall",
  sector: "Community Infrastructure",
  constituency: "Berasia, Bhopal MP",
  state: "Madhya Pradesh",
  district: "Bhopal",
  location: { lat: 23.35, lng: 77.4 },
  agency: "Rural Development Department",
  status: "In Progress",
  riskLevel: "High",
  aiScore: 32,
  aiHealthScore: 32,
  delayProbabilityPct: 78,
  predictedDelayDays: 45,
  financialProgressPct: 82,
  physicalProgressPct: 48,
  sanctionedAmountCr: 50,
  releasedAmountCr: 42.5,
  expenditureCr: 41,
  timelineAdherencePct: 40,
  pendingApprovals: 3,
  updateConsistencyPct: 50,
  startDate: "2023-01-12",
  expectedEndDate: "2024-12-31",
  imageUrl: "/images/community-hall.jpg"
};

export const bhopalNearbyProjects = [
  { name: "Rural Road Development", location: "Huzur, Bhopal MP", code: "MPLADS/2023/014", aiScore: 45 },
  { name: "Drinking Water Facility", location: "Phanda, Bhopal MP", code: "MPLADS/2022/087", aiScore: 61 },
  { name: "Solar Street Lighting", location: "Misrod, Bhopal MP", code: "MPLADS/2023/091", aiScore: 78 }
];

// ---- Full project registry (used by Projects list + Map view + detail) -----

export const projects: Project[] = [
  {
    id: "1",
    code: "MPLADS/2023/001",
    name: "Construction of Community Hall",
    sector: "Community Infrastructure",
    constituency: "Berasia, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.4, lng: 77.42 },
    agency: "Rural Development Dept.",
    status: "In Progress",
    riskLevel: "High",
    aiScore: 32,
    aiHealthScore: 32,
    delayProbabilityPct: 78,
    predictedDelayDays: 45,
    financialProgressPct: 82,
    physicalProgressPct: 48,
    sanctionedAmountCr: 50,
    releasedAmountCr: 42.5,
    expenditureCr: 41,
    timelineAdherencePct: 40,
    pendingApprovals: 3,
    updateConsistencyPct: 50,
    startDate: "2023-01-12",
    expectedEndDate: "2024-12-31"
  },
  {
    id: "2",
    code: "MPLADS/2023/014",
    name: "Rural Road Development",
    sector: "Roads & Transport",
    constituency: "Huzur, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.32, lng: 77.5 },
    agency: "Public Works Dept.",
    status: "Delayed",
    riskLevel: "High",
    aiScore: 45,
    aiHealthScore: 55,
    delayProbabilityPct: 82,
    predictedDelayDays: 78,
    financialProgressPct: 91,
    physicalProgressPct: 40,
    sanctionedAmountCr: 30,
    releasedAmountCr: 27.3,
    expenditureCr: 27.3,
    timelineAdherencePct: 35,
    pendingApprovals: 2,
    updateConsistencyPct: 45,
    startDate: "2022-11-01",
    expectedEndDate: "2024-06-30"
  },
  {
    id: "3",
    code: "MPLADS/2022/087",
    name: "Drinking Water Facility",
    sector: "Drinking Water",
    constituency: "Phanda, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.28, lng: 77.35 },
    agency: "Water Resources Dept.",
    status: "In Progress",
    riskLevel: "Medium",
    aiScore: 61,
    aiHealthScore: 61,
    delayProbabilityPct: 55,
    predictedDelayDays: 28,
    financialProgressPct: 67,
    physicalProgressPct: 65,
    sanctionedAmountCr: 18,
    releasedAmountCr: 12.1,
    expenditureCr: 12.1,
    timelineAdherencePct: 60,
    pendingApprovals: 1,
    updateConsistencyPct: 70,
    startDate: "2023-03-05",
    expectedEndDate: "2024-09-30"
  },
  {
    id: "4",
    code: "MPLADS/2023/102",
    name: "School Building Renovation",
    sector: "Education",
    constituency: "Bairagarh, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.3, lng: 77.38 },
    agency: "Education Dept.",
    status: "In Progress",
    riskLevel: "Medium",
    aiScore: 64,
    aiHealthScore: 54,
    delayProbabilityPct: 58,
    predictedDelayDays: 32,
    financialProgressPct: 54,
    physicalProgressPct: 52,
    sanctionedAmountCr: 12,
    releasedAmountCr: 6.5,
    expenditureCr: 6.5,
    timelineAdherencePct: 50,
    pendingApprovals: 2,
    updateConsistencyPct: 55,
    startDate: "2023-02-18",
    expectedEndDate: "2024-08-30"
  },
  {
    id: "5",
    code: "MPLADS/2023/076",
    name: "Primary Health Centre",
    sector: "Healthcare",
    constituency: "Kolar, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.15, lng: 77.4 },
    agency: "Health Dept.",
    status: "Completed",
    riskLevel: "Low",
    aiScore: 18,
    aiHealthScore: 92,
    delayProbabilityPct: 5,
    predictedDelayDays: 0,
    financialProgressPct: 100,
    physicalProgressPct: 100,
    sanctionedAmountCr: 20,
    releasedAmountCr: 20,
    expenditureCr: 19.8,
    timelineAdherencePct: 96,
    pendingApprovals: 0,
    updateConsistencyPct: 98,
    startDate: "2022-06-01",
    expectedEndDate: "2023-06-01"
  },
  {
    id: "6",
    code: "MPLADS/2022/091",
    name: "Solar Street Lighting",
    sector: "Community Infrastructure",
    constituency: "Misrod, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.22, lng: 77.48 },
    agency: "Urban Dev. Dept.",
    status: "Delayed",
    riskLevel: "High",
    aiScore: 78,
    aiHealthScore: 38,
    delayProbabilityPct: 88,
    predictedDelayDays: 86,
    financialProgressPct: 36,
    physicalProgressPct: 22,
    sanctionedAmountCr: 8,
    releasedAmountCr: 2.9,
    expenditureCr: 2.9,
    timelineAdherencePct: 25,
    pendingApprovals: 4,
    updateConsistencyPct: 30,
    startDate: "2022-09-15",
    expectedEndDate: "2023-12-31"
  },
  {
    id: "7",
    code: "MPLADS/2022/063",
    name: "Drainage System Improvement",
    sector: "Sanitation",
    constituency: "Neelbad, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.34, lng: 77.33 },
    agency: "Public Works Dept.",
    status: "Delayed",
    riskLevel: "High",
    aiScore: 71,
    aiHealthScore: 41,
    delayProbabilityPct: 80,
    predictedDelayDays: 62,
    financialProgressPct: 48,
    physicalProgressPct: 35,
    sanctionedAmountCr: 15,
    releasedAmountCr: 7.2,
    expenditureCr: 7.2,
    timelineAdherencePct: 30,
    pendingApprovals: 3,
    updateConsistencyPct: 40,
    startDate: "2022-08-01",
    expectedEndDate: "2023-10-31"
  },
  {
    id: "8",
    code: "MPLADS/2023/118",
    name: "Anganwadi Centre Construction",
    sector: "Community Infrastructure",
    constituency: "Bagmugaliya, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.27, lng: 77.44 },
    agency: "Women & Child Dev. Dept.",
    status: "In Progress",
    riskLevel: "Medium",
    aiScore: 56,
    aiHealthScore: 60,
    delayProbabilityPct: 50,
    predictedDelayDays: 25,
    financialProgressPct: 60,
    physicalProgressPct: 58,
    sanctionedAmountCr: 10,
    releasedAmountCr: 6,
    expenditureCr: 6,
    timelineAdherencePct: 55,
    pendingApprovals: 1,
    updateConsistencyPct: 62,
    startDate: "2023-04-10",
    expectedEndDate: "2024-07-31"
  },
  {
    id: "9",
    code: "MPLADS/2022/045",
    name: "Park Development",
    sector: "Community Infrastructure",
    constituency: "Ayodhya Bypass, Bhopal MP",
    state: "Madhya Pradesh",
    district: "Bhopal",
    location: { lat: 23.24, lng: 77.41 },
    agency: "Municipal Corporation",
    status: "In Progress",
    riskLevel: "Medium",
    aiScore: 49,
    aiHealthScore: 66,
    delayProbabilityPct: 40,
    predictedDelayDays: 18,
    financialProgressPct: 75,
    physicalProgressPct: 70,
    sanctionedAmountCr: 6,
    releasedAmountCr: 4.5,
    expenditureCr: 4.5,
    timelineAdherencePct: 65,
    pendingApprovals: 0,
    updateConsistencyPct: 72,
    startDate: "2023-05-01",
    expectedEndDate: "2024-03-31"
  },
  {
    id: "10",
    code: "MPLADS/2023/129",
    name: "Minor Bridge Construction",
    sector: "Roads & Transport",
    constituency: "Mandideep, Raisen MP",
    state: "Madhya Pradesh",
    district: "Raisen",
    location: { lat: 23.1, lng: 77.53 },
    agency: "Public Works Dept.",
    status: "Not Started",
    riskLevel: "High",
    aiScore: 82,
    aiHealthScore: 20,
    delayProbabilityPct: 90,
    predictedDelayDays: 120,
    financialProgressPct: 20,
    physicalProgressPct: 15,
    sanctionedAmountCr: 25,
    releasedAmountCr: 5,
    expenditureCr: 5,
    timelineAdherencePct: 15,
    pendingApprovals: 5,
    updateConsistencyPct: 20,
    startDate: "2023-06-01",
    expectedEndDate: "2024-11-30"
  }
];

export const projectsKpis = {
  totalProjects: 182,
  totalProjectsYoY: 12,
  completed: 94,
  completedPct: 51.6,
  inProgress: 55,
  inProgressPct: 30.2,
  delayed: 21,
  delayedPct: 11.5,
  notStarted: 12,
  notStartedPct: 6.6,
  totalAllocatedCr: 342.5,
  utilizedPct: 78,
  utilizedCr: 267.8
};

// ---- Constituency Insights (Berasia, Bhopal MP) -----------------------------

export const constituencyKpis = {
  totalProjects: 182,
  totalProjectsYoY: 12,
  totalAllocationCr: 342.5,
  fundUtilizationPct: 78,
  fundUtilizedCr: 267.8,
  avgAiHealthScore: 68,
  developmentGaps: 4,
  highRiskProjects: 21
};

export const sectorGapAnalysis: SectorGap[] = [
  { sector: "Drinking Water", needScore: 48, coveredScore: 13, gapPct: 72, gapLevel: "High", need: 48, covered: 13 },
  { sector: "Healthcare", needScore: 36, coveredScore: 15, gapPct: 42, gapLevel: "High", need: 36, covered: 15 },
  { sector: "Sanitation", needScore: 28, coveredScore: 14, gapPct: 51, gapLevel: "Medium", need: 28, covered: 14 },
  { sector: "Roads & Transport", needScore: 22, coveredScore: 17, gapPct: 76, gapLevel: "Low", need: 22, covered: 17 },
  { sector: "Community Infrastructure", needScore: 31, coveredScore: 18, gapPct: 58, gapLevel: "Medium", need: 31, covered: 18 },
  { sector: "Education", needScore: 25, coveredScore: 17, gapPct: 68, gapLevel: "Low", need: 25, covered: 17 }
];

export const coverageVsNeed = [
  { sector: "Drinking Water", implemented: 13, estimatedNeed: 48 },
  { sector: "Healthcare", implemented: 15, estimatedNeed: 36 },
  { sector: "Education", implemented: 17, estimatedNeed: 25 },
  { sector: "Sanitation", implemented: 14, estimatedNeed: 28 },
  { sector: "Roads & Transport", implemented: 17, estimatedNeed: 22 },
  { sector: "Community Infra.", implemented: 18, estimatedNeed: 31 }
];

export const wardGaps: WardGap[] = [
  { rank: 1, area: "Kheda", block: "Berasia", gapSector: "Drinking Water", needLevel: "High" },
  { rank: 2, area: "Sanchi Road", block: "Berasia", gapSector: "Healthcare", needLevel: "High" },
  { rank: 3, area: "Barkheda", block: "Berasia", gapSector: "Sanitation", needLevel: "High" },
  { rank: 4, area: "Salampatar", block: "Phanda", gapSector: "Drinking Water", needLevel: "Medium" },
  { rank: 5, area: "Ibrahimpura", block: "Berasia", gapSector: "Healthcare", needLevel: "Medium" },
  { rank: 6, area: "Jatkheri", block: "Huzur", gapSector: "Community Infra.", needLevel: "Medium" },
  { rank: 7, area: "Badwai", block: "Neelbad", gapSector: "Drinking Water", needLevel: "Medium" },
  { rank: 8, area: "Ratibad", block: "Berasia", gapSector: "Education", needLevel: "Low" }
];

export const agencyContribution: Agency[] = [
  { id: "1", name: "Rural Development Dept.", projectsCount: 48, completionRatePct: 72, avgDelayDays: 42, costVariationPct: 12, stalledProjects: 7, updateConsistencyPct: 68, aiScore: 68 },
  { id: "2", name: "Public Works Dept.", projectsCount: 36, completionRatePct: 78, avgDelayDays: 36, costVariationPct: 8, stalledProjects: 5, updateConsistencyPct: 71, aiScore: 71 },
  { id: "3", name: "Water Resources Dept.", projectsCount: 28, completionRatePct: 61, avgDelayDays: 58, costVariationPct: 18, stalledProjects: 9, updateConsistencyPct: 52, aiScore: 52 },
  { id: "4", name: "Education Dept.", projectsCount: 22, completionRatePct: 85, avgDelayDays: 28, costVariationPct: 6, stalledProjects: 3, updateConsistencyPct: 76, aiScore: 76 },
  { id: "5", name: "Health Dept.", projectsCount: 18, completionRatePct: 56, avgDelayDays: 62, costVariationPct: 21, stalledProjects: 8, updateConsistencyPct: 35, aiScore: 35 },
  { id: "6", name: "Women & Child Dev.", projectsCount: 16, completionRatePct: 75, avgDelayDays: 35, costVariationPct: 9, stalledProjects: 3, updateConsistencyPct: 69, aiScore: 69 },
  { id: "7", name: "Municipal Corporation", projectsCount: 14, completionRatePct: 80, avgDelayDays: 31, costVariationPct: 7, stalledProjects: 2, updateConsistencyPct: 74, aiScore: 74 }
];

export const investmentProgressTrend: ConstituencyTrendPoint[] = [
  { year: "2021", fundsReleasedCr: 45, expenditureCr: 32, avgPhysicalProgressPct: 28 },
  { year: "2022", fundsReleasedCr: 56, expenditureCr: 96, avgPhysicalProgressPct: 46 },
  { year: "2023", fundsReleasedCr: 71, expenditureCr: 96, avgPhysicalProgressPct: 63 },
  { year: "2024", fundsReleasedCr: 98, expenditureCr: 123, avgPhysicalProgressPct: 78 }
];

export const constituencyKeyInsight =
  "Berasia shows significant development gaps in Drinking Water and Healthcare. Despite good progress in Roads, the constituency still lacks adequate drinking water infrastructure in 12 rural areas and healthcare facilities in 8 gram panchayats.";

export const constituencyRecommendations: Recommendation[] = [
  { id: "1", priority: 1, type: "High Gap", title: "Prioritize Drinking Water projects", description: "Initiate 8-10 projects in rural Berasia, Neelbad and Phanda blocks." },
  { id: "2", priority: 2, type: "High Gap", title: "Initiate healthcare facilities", description: "Establish 5-7 PHC/CHC facilities in underserved gram panchayats." },
  { id: "3", priority: 3, type: "Medium Gap", title: "Focus on rural sanitation", description: "Focus on rural areas with low sanitation coverage." },
  { id: "4", priority: 4, type: "Monitoring", title: "Strengthen monitoring", description: "Conduct field inspections for 21 high-risk projects." },
  { id: "5", priority: 5, type: "Convergence", title: "Convergence opportunity", description: "Align with Jal Jeevan Mission and Ayushman Bharat." }
];

export const aiRecommendation =
  "Prioritize Drinking Water projects in rural Berasia and Phanda blocks. Initiate 5-7 healthcare projects in underserved gram panchayats. Improve project monitoring for delayed constituency-level works. Consider convergence with state schemes to maximize impact.";

// ---- Project Detail (Construction of Community Hall) -----------------------

export const projectDetailTimeline = [
  { label: "Project Sanctioned", date: "12 Jan 2023", status: "Completed" as const },
  { label: "Work Order Issued", date: "15 Feb 2023", status: "Completed" as const },
  { label: "Foundation Completed", date: "20 Jun 2023", status: "Completed" as const },
  { label: "Structure Work", date: "30 Sep 2023", status: "Delayed" as const },
  { label: "Finishing Work", date: "31 Mar 2024", status: "In Progress" as const },
  { label: "Project Completion", date: "31 Dec 2024", status: "Pending" as const }
];

export const projectFinancialTrend = [
  { quarter: "Q3 2023", cumulative: 8, expected: 12 },
  { quarter: "Q4 2023", cumulative: 18, expected: 22 },
  { quarter: "Q1 2024", cumulative: 26, expected: 32 },
  { quarter: "Q2 2024", cumulative: 33, expected: 40 },
  { quarter: "Q3 2024", cumulative: 38, expected: 46 },
  { quarter: "Q4 2024", cumulative: 41, expected: 50 }
];

export const projectPhotos = [
  { date: "12 Jan 2024", url: "/images/site-1.jpg" },
  { date: "18 Mar 2024", url: "/images/site-2.jpg" },
  { date: "25 May 2024", url: "/images/site-3.jpg" },
  { date: "10 Aug 2024", url: "/images/site-4.jpg" }
];

export const projectAiInsights = [
  "High expenditure (82%) but low physical progress (48%).",
  "Timeline slippage detected based on current trend.",
  "Spending rate is 2.3x higher than comparable projects.",
  "Last update was 45 days ago.",
  "Similar projects by this agency average delay of 62 days."
];

export const projectRiskIndicators = [
  { id: "1", title: "Unexpected spending jumps", detail: "40% of expenditure claimed in last 3 months", severity: "High" as const },
  { id: "2", title: "Stalled project risk", detail: "No significant progress in last 45 days", severity: "High" as const },
  { id: "3", title: "Unusual cost variation", detail: "Material cost 35% higher than similar projects", severity: "High" as const },
  { id: "4", title: "Sudden progress claims", detail: "Reported 20% progress in 10 days", severity: "Medium" as const },
  { id: "5", title: "Long periods without updates", detail: "No field updates for 45 days", severity: "Medium" as const }
];

export const projectRadar = [
  { metric: "Financial Progress", value: 82 },
  { metric: "Physical Progress", value: 48 },
  { metric: "Timeline Adherence", value: 40 },
  { metric: "Update Consistency", value: 50 },
  { metric: "Pending Approvals", value: 60 },
  { metric: "Expenditure Pattern", value: 35 }
];

// ---- MP Attention Centre -----------------------------------------------------

export const attentionSummary = {
  likelyDelayed: 3,
  financialAnomalies: 2,
  underperformingAgencies: 1,
  underservedAreas: 4
};

export const priorityQueueCount = 5;


// -----------------------------------------------------------------------------
// Geographic map data (real WGS84 coordinates)
//
// Used by the Leaflet map panels. Previously these were percentage offsets
// against a fake map image; they are now real lat/lng so they can be fed to
// any map SDK directly, and so they line up with the `location` field the
// backend returns per project.
// -----------------------------------------------------------------------------


/** Bhopal / Madhya Pradesh — map centre and project pins. */
export const BHOPAL_CENTRE: [number, number] = [23.2599, 77.4126];

export const bhopalMapPins: GeoPin[] = [
  {
    id: "1",
    lat: 23.6295,
    lng: 77.4325,
    status: "High Risk",
    label: "Construction of Community Hall",
    sublabel: "Berasia, Bhopal",
    code: "MPLADS/2023/001",
    aiScore: 32
  },
  { id: "2", lat: 23.2010, lng: 77.4500, status: "Delayed", label: "Rural Road Development", sublabel: "Huzur, Bhopal", code: "MPLADS/2023/014", aiScore: 45 },
  { id: "3", lat: 23.2820, lng: 77.3010, status: "In Progress", label: "Drinking Water Facility", sublabel: "Phanda, Bhopal", code: "MPLADS/2022/087", aiScore: 61 },
  { id: "4", lat: 23.2790, lng: 77.3402, status: "In Progress", label: "School Building Renovation", sublabel: "Bairagarh, Bhopal", code: "MPLADS/2023/102", aiScore: 64 },
  { id: "5", lat: 23.1620, lng: 77.4405, status: "Completed", label: "Primary Health Centre", sublabel: "Kolar, Bhopal", code: "MPLADS/2023/076", aiScore: 18 },
  { id: "6", lat: 23.1805, lng: 77.4720, status: "Delayed", label: "Solar Street Lighting", sublabel: "Misrod, Bhopal", code: "MPLADS/2022/091", aiScore: 78 },
  { id: "7", lat: 23.1590, lng: 77.3610, status: "Delayed", label: "Drainage System Improvement", sublabel: "Neelbad, Bhopal", code: "MPLADS/2022/063", aiScore: 71 },
  { id: "8", lat: 23.1902, lng: 77.4512, status: "In Progress", label: "Anganwadi Centre Construction", sublabel: "Bagmugaliya, Bhopal", code: "MPLADS/2023/118", aiScore: 56 },
  { id: "9", lat: 23.2905, lng: 77.4508, status: "In Progress", label: "Park Development", sublabel: "Ayodhya Bypass, Bhopal", code: "MPLADS/2022/045", aiScore: 49 },
  { id: "10", lat: 23.1010, lng: 77.5325, status: "Not Started", label: "Minor Bridge Construction", sublabel: "Mandideep, Raisen", code: "MPLADS/2023/129", aiScore: 82 },
  { id: "11", lat: 23.2455, lng: 77.3905, status: "Completed", label: "Library Building", sublabel: "Bhopal city", code: "MPLADS/2022/021", aiScore: 20 },
  { id: "12", lat: 23.3210, lng: 77.4210, status: "High Risk", label: "Rural Water Tank", sublabel: "Berasia block", code: "MPLADS/2023/136", aiScore: 84 }
];

export const bhopalHeatZones: GeoHeatZone[] = [
  { id: "h1", lat: 23.6295, lng: 77.4325, radiusMetres: 6000, intensity: "high", label: "Berasia – major risk hotspot" },
  { id: "h2", lat: 23.1805, lng: 77.4720, radiusMetres: 4200, intensity: "high", label: "Misrod – major risk hotspot" },
  { id: "h3", lat: 23.1590, lng: 77.3610, radiusMetres: 3800, intensity: "medium", label: "Neelbad – delay cluster" }
];

/** Berasia constituency view (Constituency Insights page). */
export const BERASIA_CENTRE: [number, number] = [23.6295, 77.4325];

export const berasiaMapPins: GeoPin[] = [
  { id: "1", lat: 23.6295, lng: 77.4325, status: "High Risk", label: "Construction of Community Hall", sublabel: "Berasia", code: "MPLADS/2023/001", aiScore: 32 },
  { id: "2", lat: 23.6602, lng: 77.4010, status: "Delayed", label: "Kheda Water Supply", sublabel: "Kheda, Berasia", code: "MPLADS/2023/141", aiScore: 68 },
  { id: "3", lat: 23.5905, lng: 77.4680, status: "In Progress", label: "Sanchi Road Health Post", sublabel: "Sanchi Road, Berasia", code: "MPLADS/2023/149", aiScore: 54 },
  { id: "4", lat: 23.6105, lng: 77.3820, status: "High Risk", label: "Barkheda Sanitation Works", sublabel: "Barkheda, Berasia", code: "MPLADS/2022/077", aiScore: 76 },
  { id: "5", lat: 23.6510, lng: 77.4605, status: "Completed", label: "Ratibad School Block", sublabel: "Ratibad, Berasia", code: "MPLADS/2022/034", aiScore: 23 }
];

export const berasiaHeatZones: GeoHeatZone[] = [
  { id: "h1", lat: 23.6602, lng: 77.4010, radiusMetres: 3200, intensity: "high", label: "Kheda – high drinking water gap" },
  { id: "h2", lat: 23.6105, lng: 77.3820, radiusMetres: 2600, intensity: "high", label: "Barkheda – high sanitation gap" },
  { id: "h3", lat: 23.5905, lng: 77.4680, radiusMetres: 2400, intensity: "medium", label: "Sanchi Road – healthcare gap" }
];


// -----------------------------------------------------------------------------
// Dashboard home screen ("Welcome, <MP>") data
// -----------------------------------------------------------------------------

export const dashboardMeta = {
  lastUpdated: "14 Dec 2024, 10:45 AM",
  dateRange: "Apr 2021 – Dec 2024"
};

export const dashboardKpis = {
  totalProjects: { value: 182, deltaPct: 12 },
  completed: { value: 94, deltaPct: 8 },
  delayed: { value: 21, deltaPct: 40 },
  needsAttention: { value: 12, deltaPct: 20 },
  totalAllocatedCr: 342.5,
  utilizedPct: 78
};

export const statusDistribution = [
  { label: "Completed", value: 94, pct: 51.6, color: "#22c55e" },
  { label: "In Progress", value: 55, pct: 30.2, color: "#3b82f6" },
  { label: "Delayed", value: 21, pct: 11.5, color: "#ef4444" },
  { label: "Not Started", value: 12, pct: 6.6, color: "#f59e0b" }
];

/**
 * Replaces the map panel on the dashboard: same "where are the projects"
 * question, answered as a block-wise status breakdown instead of pins.
 * Counts reconcile exactly with `statusDistribution` and the 182 total.
 */
export const blockBreakdown = [
  { block: "Berasia", total: 42, completed: 22, inProgress: 12, delayed: 6, notStarted: 2 },
  { block: "Huzur", total: 38, completed: 20, inProgress: 11, delayed: 5, notStarted: 2 },
  { block: "Phanda", total: 31, completed: 16, inProgress: 10, delayed: 3, notStarted: 2 },
  { block: "Bairagarh", total: 26, completed: 14, inProgress: 8, delayed: 3, notStarted: 1 },
  { block: "Kolar", total: 24, completed: 13, inProgress: 7, delayed: 2, notStarted: 2 },
  { block: "Misrod", total: 21, completed: 9, inProgress: 7, delayed: 2, notStarted: 3 }
];

export const fundUtilizationTrend = [
  { year: "2021", allocated: 52, utilized: 38 },
  { year: "2022", allocated: 148, utilized: 118 },
  { year: "2023", allocated: 248, utilized: 196 },
  { year: "2024", allocated: 342.5, utilized: 267.8 }
];

/**
 * NOTE: these are HEALTH scores (0-100, higher = healthier), so severity runs
 * inversely to the number: 32/100 is CRITICAL, 78/100 is LOW risk.
 */
export type QueueSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export const dashboardPriorityQueue: {
  id: string;
  severity: QueueSeverity;
  healthScore: number;
  name: string;
  location: string;
  reason: string;
}[] = [
  {
    id: "1",
    severity: "CRITICAL",
    healthScore: 32,
    name: "Construction of Community Hall",
    location: "Berasia, Bhopal",
    reason: "High expenditure with low progress"
  },
  {
    id: "2",
    severity: "HIGH",
    healthScore: 45,
    name: "Rural Road Development",
    location: "Huzur, Bhopal",
    reason: "Delay probability 81%"
  },
  {
    id: "3",
    severity: "MEDIUM",
    healthScore: 61,
    name: "Drinking Water Facility",
    location: "Phanda, Bhopal",
    reason: "Inconsistent progress updates"
  },
  {
    id: "4",
    severity: "MEDIUM",
    healthScore: 64,
    name: "School Building Renovation",
    location: "Bairagarh, Bhopal",
    reason: "Possible photo mismatch"
  },
  {
    id: "5",
    severity: "LOW",
    healthScore: 78,
    name: "Primary Health Centre",
    location: "Kolar, Bhopal",
    reason: "On track"
  }
];

export const topAgencies = [
  { name: "Rural Development Dept.", projects: 42, completionRatePct: 88, avgDelayDays: 12, score: 82 },
  { name: "Public Works Dept.", projects: 36, completionRatePct: 67, avgDelayDays: 45, score: 61 },
  { name: "Zila Panchayat", projects: 28, completionRatePct: 71, avgDelayDays: 38, score: 68 },
  { name: "Water Resources Dept.", projects: 24, completionRatePct: 58, avgDelayDays: 62, score: 52 },
  { name: "Education Dept.", projects: 18, completionRatePct: 94, avgDelayDays: 8, score: 86 }
];

export const attentionCentreItems: {
  id: string;
  tone: "red" | "amber" | "orange" | "blue";
  title: string;
  detail?: string;
}[] = [
  { id: "1", tone: "red", title: "3 projects likely to delay" },
  { id: "2", tone: "amber", title: "2 financial anomalies detected" },
  { id: "3", tone: "orange", title: "1 agency needs attention", detail: "Public Works Dept." },
  {
    id: "4",
    tone: "blue",
    title: "4 development gaps in your constituency",
    detail: "Mainly in rural water supply and healthcare"
  }
];

export const attentionCentreNewCount = 4;

export const dashboardAiInsight = {
  highlight: "5 projects",
  lead: "Based on current trends,",
  tail: "are at high risk of delay in the next 3 months.",
  recommendation: "Recommend prioritizing inspection for projects in Berasia and Huzur blocks."
};

export const governanceQuote = {
  text: "Data-driven governance leads to stronger democracy and greater development.",
  attribution: "NITI Aayog"
};
