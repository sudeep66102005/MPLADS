import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { FileBarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Reports"
        subtitle="Fund releases, expenditure, work registers and AI-flagged risk reports — exportable for MoSPI / Nodal Authority review"
      />
      <ComingSoon
        icon={FileBarChart2}
        title="Reporting module — in build"
        description="Will mirror and extend eSAKSHI's existing public reports (fund releases, expenditure, state/district profiles, completed & non-progress works) with AI-generated risk and gap summaries layered on top."
        bullets={[
          "Constituency / district / state-wise report exports (PDF, CSV)",
          "Non-progress and delayed works report, enriched with AI delay predictions",
          "Agency performance and anomaly summary reports"
        ]}
      />
    </AppShell>
  );
}
