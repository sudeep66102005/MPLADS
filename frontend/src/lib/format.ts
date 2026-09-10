export function cr(value: number): string {
  return `₹${value.toFixed(1)} Cr`;
}

export function pct(value: number): string {
  return `${value}%`;
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function riskColor(score: number): { text: string; bg: string; dot: string } {
  if (score >= 70) return { text: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" };
  if (score >= 50) return { text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" };
  if (score >= 30) return { text: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" };
  return { text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" };
}

export function statusColor(status: string): { text: string; bg: string } {
  switch (status) {
    case "Completed":
      return { text: "text-emerald-700", bg: "bg-emerald-50" };
    case "In Progress":
      return { text: "text-blue-700", bg: "bg-blue-50" };
    case "Delayed":
      return { text: "text-red-700", bg: "bg-red-50" };
    case "Not Started":
      return { text: "text-amber-700", bg: "bg-amber-50" };
    case "High Risk":
      return { text: "text-red-700", bg: "bg-red-50" };
    default:
      return { text: "text-slate-700", bg: "bg-slate-50" };
  }
}
