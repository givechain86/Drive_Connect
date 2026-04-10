"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type CdlClass,
  formatAvailabilityDate,
  formatMiles,
} from "@/lib/driver-fields";

export type DriverProfileCardProps = {
  driverId: string;
  fullName: string;
  location: string | null;
  available: boolean;
  experienceYears: number;
  licenseType: string | null;
  cdlClass: CdlClass | null;
  endorsements: string[];
  milesDriven: number | null;
  backgroundCheckVerified: boolean;
  willingToRelocate: boolean;
  availabilityStartsAt: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  tags?: string[];
  hireHref: string;
  viewHref?: string;
  className?: string;
  style?: React.CSSProperties;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTenureYears(years: number): string {
  if (years >= 8) return "8+ yrs";
  if (years <= 0) return "New";
  return `${years} yrs`;
}

function defaultTags(d: {
  endorsements: string[];
  willingToRelocate: boolean;
  experienceYears: number;
}): string[] {
  const t: string[] = [];
  for (const e of d.endorsements.slice(0, 2)) {
    t.push(e);
  }
  if (d.willingToRelocate) t.push("Open to relocate");
  if (d.experienceYears >= 5) t.push("Long haul ready");
  if (t.length < 3) t.push("Commercial driver");
  return [...new Set(t)].slice(0, 4);
}

function availabilityLine(available: boolean, startsAt: string | null): string {
  if (!available) return "Not seeking work";
  const d = formatAvailabilityDate(startsAt);
  if (d) return `Available from ${d}`;
  return "Available now";
}

export function DriverProfileCard({
  driverId,
  fullName,
  location,
  available,
  experienceYears,
  licenseType,
  cdlClass,
  endorsements,
  milesDriven,
  backgroundCheckVerified,
  willingToRelocate,
  availabilityStartsAt,
  ratingAvg,
  ratingCount,
  tags: tagsProp,
  hireHref,
  viewHref,
  className,
  style,
}: DriverProfileCardProps) {
  const view = viewHref ?? `/drivers/${driverId}`;
  const tags =
    tagsProp?.length ?
      tagsProp
    : defaultTags({
        endorsements,
        willingToRelocate,
        experienceYears,
      });

  const displayName = fullName || "Driver";
  const loc = location?.trim() || "—";
  const ratingText =
    ratingAvg != null && ratingCount > 0 ?
      ratingAvg.toFixed(1)
    : null;
  const cdlLabel =
    cdlClass ?
      `Class ${cdlClass}`
    : licenseType?.trim() ?
      licenseType
    : "—";
  const startLabel = formatAvailabilityDate(availabilityStartsAt);

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
            <p className="text-sm text-zinc-500">
              <span className="text-zinc-400">{loc}</span>
              {willingToRelocate && (
                <span className="text-zinc-500"> · Willing to relocate</span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {backgroundCheckVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  <span aria-hidden className="leading-none">
                    ✅
                  </span>
                  Background check
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                  available
                    ? "border-emerald-500/35 bg-zinc-900/80 text-emerald-300"
                    : "border-zinc-600 bg-zinc-900 text-zinc-500"
                )}
              >
                {availabilityLine(available, availabilityStartsAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-800/90 pt-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-zinc-500">CDL class</p>
            <p className="mt-0.5 font-semibold text-white">{cdlLabel}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Miles driven</p>
            <p className="mt-0.5 font-semibold text-white">{formatMiles(milesDriven)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-zinc-500">Endorsements</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {endorsements.length ?
                endorsements.map((e) => (
                  <span
                    key={e}
                    className="rounded-md border border-zinc-700/90 bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-zinc-300"
                  >
                    {e}
                  </span>
                ))
              : <span className="text-sm font-medium text-zinc-600">—</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Base</p>
            <p className="mt-0.5 font-semibold text-white">{loc}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Availability date</p>
            <p className="mt-0.5 font-semibold text-white">
              {!available ? "—" : startLabel ? startLabel : "Immediate"}
            </p>
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
          <div>
            <p className="text-xs text-zinc-500">Tenure</p>
            <p className="mt-0.5 font-semibold text-white">
              {formatTenureYears(experienceYears)}
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

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href={hireHref}
          className={cn(
            "flex h-11 items-center justify-center rounded-xl text-center text-sm font-semibold text-zinc-950",
            "bg-gradient-to-r from-emerald-300 to-emerald-600 shadow-[0_6px_28px_-6px_rgba(16,185,129,0.55)]",
            "transition hover:brightness-110 active:scale-[0.98]"
          )}
        >
          Hire
        </Link>
        <Link
          href={view}
          className={cn(
            "flex h-11 items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/50 text-center text-sm font-semibold text-white",
            "transition hover:border-zinc-500 hover:bg-zinc-800/60 active:scale-[0.98]"
          )}
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

export function DriverProfileCardSkeleton() {
  return (
    <div className="rounded-[1.25rem] border border-emerald-500/25 bg-[#0a0a0a]/90 p-6 shadow-[0_0_32px_-12px_rgba(16,185,129,0.25)]">
      <div className="flex gap-3">
        <div className="flex flex-1 gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-xs" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 border-t border-zinc-800/90 pt-5">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={`b${i}`} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
    </div>
  );
}
