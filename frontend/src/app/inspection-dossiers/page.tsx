import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { FolderClock } from "lucide-react";

export default function InspectionDossiersPage() {
  return (
    <AppShell>
      <PageHeader
        title="Inspection Dossiers"
        subtitle="Auto-generated, one-page case files for flagged projects — evidence, alert reason, and recommended checks in one place"
      />
      <ComingSoon
        icon={FolderClock}
        title="Inspection workflow — in build"
        description="Every project pulled from the AI Priority Queue for a physical check will get an auto-generated dossier here: the alert, the photo/financial evidence, and the exact checks a field officer should perform."
        bullets={[
          "One-page case file per flagged project (alert + evidence + checklist)",
          "Officer outcome capture: genuine issue / false positive / needs more evidence / resolved",
          "Feedback loop: officer outcomes retrain future AI scoring"
        ]}
      />
    </AppShell>
  );
}
