import { classNames } from "@/lib/format";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
  /** When true, renders an upward-trend arrow beside `subValue`. */
  trend?: boolean;
}

export function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subValue,
  subValueColor = "text-slate-500",
  trend
}: KpiCardProps) {
  return (
    <div className="card p-4 flex items-start gap-3 min-w-0">
      <div className={classNames("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
        {subValue ? (
          <p className={classNames("text-xs font-medium flex items-center gap-1", subValueColor)}>
            {trend ? <ArrowUpRight size={12} /> : null}
            {subValue}
          </p>
        ) : null}
      </div>
    </div>
  );
}
