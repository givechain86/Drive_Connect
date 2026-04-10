import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingDriverPreview } from "@/lib/landing-preview";

type Props = {
  driver: LandingDriverPreview;
  className?: string;
};

export function LandingDriverCard({ driver, className }: Props) {
  return (
    <Link
      href={`/drivers/${driver.userId}`}
      className={cn(
        "landing-card-hover group block rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-4 shadow-lg shadow-black/20 transition-all duration-200",
        "hover:border-emerald-500/40 hover:shadow-[0_0_32px_-8px_rgba(16,185,129,0.35)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-white group-hover:text-emerald-100">
              {driver.fullName}
            </p>
            {driver.topRated && (
              <span className="shrink-0 rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                Top rated
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{driver.location ?? "—"}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex items-center gap-0.5 text-sm font-semibold text-white">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {driver.rating.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500">{driver.distanceMiles} mi away</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
            driver.available
              ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
              : "border-zinc-600 bg-zinc-800/80 text-zinc-500"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              driver.available ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-zinc-500"
            )}
          />
          {driver.available ? "Available" : "Unavailable"}
        </span>
        <span className="text-xs font-medium text-emerald-400/90 opacity-0 transition-opacity group-hover:opacity-100">
          View profile →
        </span>
      </div>
    </Link>
  );
}
