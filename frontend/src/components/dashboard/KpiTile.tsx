import { ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { classNames } from "@/lib/format";

type Tint = "blue" | "green" | "red" | "amber" | "plain";

const tintStyles: Record<Tint, { card: string; icon: string }> = {
  blue: { card: "bg-blue-50/70 border-blue-100", icon: "text-blue-600" },
  green: { card: "bg-emerald-50/70 border-emerald-100", icon: "text-emerald-600" },
  red: { card: "bg-red-50/70 border-red-100", icon: "text-red-500" },
  amber: { card: "bg-amber-50/70 border-amber-100", icon: "text-amber-500" },
  plain: { card: "bg-white border-slate-200", icon: "text-slate-500" }
};

const deltaTone = {
  positive: "text-emerald-600",
  negative: "text-red-500",
  warning: "text-amber-600"
} as const;

interface KpiTileProps {
  icon: LucideIcon;
  tint: Tint;
  label: string;
  value: string;
  deltaPct?: number;
  tone?: keyof typeof deltaTone;
  /** Extra content rendered under the value (e.g. a utilization bar). */
  children?: React.ReactNode;
}

export function KpiTile({
  icon: Icon,
  tint,
  label,
  value,
  deltaPct,
  tone = "positive",
  children
}: KpiTileProps) {
  const styles = tintStyles[tint];

  return (
    <div className={classNames("rounded-xl border p-3.5 flex items-start gap-3", styles.card)}>
      <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
        <Icon size={20} className={styles.icon} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500 truncate">{label}</p>
        <p className="text-[22px] font-bold text-slate-900 leading-tight">{value}</p>

        {deltaPct !== undefined ? (
          <p className="text-[11px] font-medium flex items-center gap-1">
            <span className={classNames("flex items-center", deltaTone[tone])}>
              <ArrowUp size={11} strokeWidth={2.5} />
              {deltaPct}%
            </span>
            <span className="text-slate-400 font-normal">vs. last year</span>
          </p>
        ) : null}

        {children}
      </div>
    </div>
  );
}
