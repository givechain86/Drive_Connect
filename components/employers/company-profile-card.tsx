"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type CompanyProfileCardProps = {
  companyName: string;
  /** Line under the company name (e.g. primary market) */
  subtitle: string | null;
  hiring: boolean;
  openJobsCount: number;
  /** Short “about” line for the grid */
  focusLine: string | null;
  locationsLine: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  tags?: string[];
  jobsHref?: string;
  contactHref?: string;
  /** Hide bottom actions (e.g. on company detail page) */
  showActions?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function initials(companyName: string): string {
  const parts = companyName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function defaultTags(d: {
  openJobsCount: number;
  locationsLine: string | null;
}): string[] {
  const t: string[] = [];
  t.push(d.openJobsCount >= 3 ? "Actively hiring" : d.openJobsCount > 0 ? "Open roles" : "Building team");
  t.push(d.locationsLine?.includes("·") ? "Multi-location" : d.locationsLine ? "Regional ops" : "Flexible hiring");
  t.push("Verified on hub");
  return t;
}

function HiringPill({ hiring }: { hiring: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        hiring
          ? "border-emerald-500/40 bg-emerald-950/70 text-emerald-300"
          : "border-zinc-600 bg-zinc-900 text-zinc-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          hiring ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" : "bg-zinc-500"
        )}
      />
      {hiring ? "Hiring" : "No open roles"}
    </span>
  );
}

export function CompanyProfileCard({
  companyName,
  subtitle,
  hiring,
  openJobsCount,
  focusLine,
  locationsLine,
  ratingAvg,
  ratingCount,
  tags: tagsProp,
  jobsHref,
  contactHref,
  showActions = true,
  className,
  style,
}: CompanyProfileCardProps) {
  const tags =
    tagsProp?.length ?
      tagsProp
    : defaultTags({
        openJobsCount,
        locationsLine,
      });

  const displayName = companyName.trim() || "Company";
  const ratingText =
    ratingAvg != null && ratingCount > 0 ?
      ratingAvg.toFixed(1)
    : null;
  const focus = focusLine?.trim() || "—";
  const locs = locationsLine?.trim() || "—";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-emerald-500/35 bg-[#0a0a0a]/90 p-6 shadow-[0_0_42px_-10px_rgba(16,185,129,0.4)] backdrop-blur-md",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 text-base font-bold tracking-tight text-white ring-[3px] ring-emerald-400/55 shadow-[0_0_28px_rgba(52,211,153,0.5)]"
            aria-hidden
          >
            {initials(displayName)}
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="truncate text-lg font-semibold text-white">{displayName}</h3>
            <p className="truncate text-sm text-zinc-500">
              {subtitle?.trim() || "Fleet & logistics"}
            </p>
          </div>
        </div>
        <HiringPill hiring={hiring} />
      </div>

      <div className="mt-5 border-t border-zinc-800/90 pt-5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Open roles</p>
            <p className="mt-0.5 font-semibold text-white">{openJobsCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Locations</p>
            <p className="mt-0.5 font-semibold text-white">{locs}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Focus</p>
            <p className="mt-0.5 line-clamp-2 font-semibold text-white">{focus}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Rating</p>
            <p className="mt-0.5 font-semibold text-white">
              {ratingText != null ?
                <>
                  <span className="text-amber-400" aria-hidden>
                    ★{" "}
                  </span>
                  {ratingText}
                </>
              : <span className="text-zinc-500">—</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((label) => (
          <span
            key={label}
            className="rounded-full border border-zinc-700/80 bg-zinc-900/90 px-3 py-1 text-xs text-zinc-400"
          >
            {label}
          </span>
        ))}
      </div>

      {showActions && jobsHref && contactHref && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={jobsHref}
            className={cn(
              "flex h-11 items-center justify-center rounded-xl text-center text-sm font-semibold text-zinc-950",
              "bg-gradient-to-r from-emerald-300 to-emerald-600 shadow-[0_6px_28px_-6px_rgba(16,185,129,0.55)]",
              "transition hover:brightness-110 active:scale-[0.98]"
            )}
          >
            View jobs
          </Link>
          <Link
            href={contactHref}
            className={cn(
              "flex h-11 items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/50 text-center text-sm font-semibold text-white",
              "transition hover:border-zinc-500 hover:bg-zinc-800/60 active:scale-[0.98]"
            )}
          >
            Contact
          </Link>
        </div>
      )}
    </article>
  );
}

export function CompanyProfileCardSkeleton() {
  return (
    <div className="rounded-[1.25rem] border border-emerald-500/25 bg-[#0a0a0a]/90 p-6 shadow-[0_0_32px_-12px_rgba(16,185,129,0.25)]">
      <div className="flex justify-between gap-3">
        <div className="flex flex-1 gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-7 w-28 shrink-0 rounded-full" />
      </div>
      <div className="mt-5 border-t border-zinc-800/90 pt-5">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
    </div>
  );
}
