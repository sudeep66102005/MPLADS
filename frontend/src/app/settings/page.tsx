import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { currentUser } from "@/lib/mockData";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Manage your profile, role access and notification preferences" />

      <div className="card p-6 max-w-2xl space-y-5">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Name</p>
          <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Role</p>
          <p className="text-sm font-semibold text-slate-800">{currentUser.role}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Access Boundaries</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Same access boundaries as eSAKSHI apply — this AI layer does not introduce new user roles; it gives
            each existing MPLADS stakeholder role a smarter, prioritized view of the data they already have
            access to.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Notifications</p>
          <label className="flex items-center gap-2 text-xs text-slate-600 mb-1.5">
            <input type="checkbox" defaultChecked className="accent-blue-600" /> High-risk project alerts
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600 mb-1.5">
            <input type="checkbox" defaultChecked className="accent-blue-600" /> Weekly constituency digest
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" className="accent-blue-600" /> Agency performance updates
          </label>
        </div>
      </div>
    </AppShell>
  );
}
