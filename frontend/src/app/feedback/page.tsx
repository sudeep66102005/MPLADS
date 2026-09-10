import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { MessageSquareText, Send } from "lucide-react";

export default function FeedbackPage() {
  return (
    <AppShell>
      <PageHeader
        title="Feedback"
        subtitle="Tell us when an AI flag was a false positive, or when something important was missed — this closes the officer-feedback loop that improves future scoring"
      />

      <div className="card p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText size={18} className="text-blue-600" />
          <p className="text-sm font-semibold text-slate-800">Submit Feedback</p>
        </div>

        <label className="block text-xs font-medium text-slate-600 mb-1">Related Project (optional)</label>
        <input
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search project name or ID..."
        />

        <label className="block text-xs font-medium text-slate-600 mb-1">Feedback Type</label>
        <select className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>False positive — this AI flag was not accurate</option>
          <option>Missed issue — the AI should have flagged this</option>
          <option>General feedback / suggestion</option>
        </select>

        <label className="block text-xs font-medium text-slate-600 mb-1">Details</label>
        <textarea
          rows={4}
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what you observed..."
        />

        <button className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
          <Send size={14} /> Submit Feedback
        </button>
      </div>
    </AppShell>
  );
}
