import { classNames } from "@/lib/format";

interface BadgeProps {
  children: React.ReactNode;
  color?: "red" | "amber" | "blue" | "emerald" | "purple" | "slate";
  className?: string;
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  purple: "bg-purple-50 text-purple-700",
  slate: "bg-slate-100 text-slate-700"
};

export function Badge({ children, color = "slate", className }: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

export function riskBadgeColor(score: number): BadgeProps["color"] {
  if (score >= 70) return "red";
  if (score >= 50) return "amber";
  if (score >= 30) return "blue";
  return "emerald";
}

export function statusBadgeColor(status: string): BadgeProps["color"] {
  switch (status) {
    case "Completed":
      return "emerald";
    case "In Progress":
      return "blue";
    case "Delayed":
    case "High Risk":
      return "red";
    case "Not Started":
      return "amber";
    default:
      return "slate";
  }
}
