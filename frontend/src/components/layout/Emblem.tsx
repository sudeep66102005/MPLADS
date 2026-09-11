import { Landmark } from "lucide-react";
import { classNames } from "@/lib/format";

/**
 * Placeholder for the State Emblem of India used in the government branding
 * lockup.
 *
 * The official emblem is a restricted symbol and no licensed asset was
 * supplied, so this renders a neutral stand-in. To use the real emblem, drop
 * the approved file at `public/emblem.svg` and swap the icon below for
 * `<img src="/emblem.svg" alt="" />` — note that under a GitHub Pages
 * sub-path deployment the src must be prefixed with
 * `process.env.NEXT_PUBLIC_BASE_PATH`.
 */
export function Emblem({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={classNames(
        "inline-flex items-center justify-center rounded-md bg-white/10 shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Landmark size={size * 0.58} className="text-slate-200" />
    </span>
  );
}
