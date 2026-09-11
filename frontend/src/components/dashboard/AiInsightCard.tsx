import { Lightbulb, FileText } from "lucide-react";
import { dashboardAiInsight, governanceQuote } from "@/lib/mockData";

export function AiInsightCard() {
  return (
    <section className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        <Lightbulb size={17} className="text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-xs font-bold text-slate-800 mb-0.5">AI Insight</h2>
        <p className="text-[11.5px] text-slate-600 leading-relaxed">
          {dashboardAiInsight.lead}{" "}
          <span className="font-semibold text-slate-800">{dashboardAiInsight.highlight}</span>{" "}
          {dashboardAiInsight.tail}
        </p>
        <p className="text-[11.5px] text-slate-500 leading-relaxed">
          {dashboardAiInsight.recommendation}
        </p>
      </div>

      <button className="inline-flex items-center justify-center gap-1.5 text-[11.5px] font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 shrink-0 whitespace-nowrap">
        <FileText size={14} />
        Generate Full Report
      </button>
    </section>
  );
}

export function GovernanceQuote() {
  return (
    <figure className="px-3 py-1">
      <span className="text-3xl leading-none text-slate-300 font-serif">&ldquo;</span>
      <blockquote className="text-[11px] italic text-slate-500 leading-relaxed -mt-2">
        {governanceQuote.text}
      </blockquote>
      <figcaption className="text-[10.5px] text-slate-400 text-right mt-1">
        &mdash; {governanceQuote.attribution}
      </figcaption>
    </figure>
  );
}
