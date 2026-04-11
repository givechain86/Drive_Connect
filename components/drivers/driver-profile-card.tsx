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
  /** Dense layout for directory grids (~6 cards per viewport). */
  variant?: "default" | "compact";
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
  variant = "default",
  className,
  style,
}: DriverProfileCardProps) {
  const compact = variant === "compact";
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

  const endorsementsLine =
    endorsements.length > 0 ? endorsements.join(", ") : "—";

  return (
    <article
      className={cn(
        "relative overflow-hidden border border-emerald-500/35 bg-[#0a0a0a]/90 backdrop-blur-md",
        compact ?
          "rounded-xl p-3 shadow-[0_0_24px_-12px_rgba(16,185,129,0.35)]"
        : "rounded-[1.25rem] p-6 shadow-[0_0_42px_-10px_rgba(16,185,129,0.4)]",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 font-bold tracking-tight text-white ring-emerald-400/55",
              compact ?
                "h-9 w-9 text-xs ring-2 shadow-[0_0_16px_rgba(52,211,153,0.35)]"
              : "h-16 w-16 text-base ring-[3px] shadow-[0_0_28px_rgba(52,211,153,0.5)]"
            )}
            aria-hidden
          >
            {initials(displayName)}
          </div>
          <div className="min-w-0 pt-0.5">
            <h3
              className={cn(
                "truncate font-semibold text-white",
                compact ? "text-sm leading-tight" : "text-lg"
              )}
            >
              {displayName}
            </h3>
            <p
              className={cn(
                "text-zinc-500",
                compact ? "truncate text-[11px] leading-snug" : "text-sm"
              )}
            >
              <span className="text-zinc-400">{loc}</span>
              {!compact && willingToRelocate && (
                <span className="text-zinc-500"> · Willing to relocate</span>
              )}
            </p>
            <div
              className={cn(
                "flex flex-wrap items-center gap-1.5",
                compact ? "mt-1" : "mt-2 gap-2"
              )}
            >
              {!compact && backgroundCheckVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  <span aria-hidden className="leading-none">
                    ✅
                  </span>
                  Background check
                </span>
              )}
              <span
                className={cn(
                  "inline-flex max-w-full items-center gap-1 rounded-full border font-medium",
                  compact ?
                    "truncate px-1.5 py-0.5 text-[10px] leading-tight"
                  : "gap-1.5 px-2 py-0.5 text-xs",
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

      <div
        className={cn(
          "border-t border-zinc-800/90",
          compact ? "mt-2.5 pt-2.5" : "mt-5 pt-5"
        )}
      >
        {compact ?
          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-[11px] leading-tight">
            <div>
              <p className="text-zinc-500">CDL</p>
              <p className="mt-0.5 truncate font-semibold text-white">{cdlLabel}</p>
            </div>
            <div>
              <p className="text-zinc-500">Miles</p>
              <p className="mt-0.5 truncate font-semibold text-white">
                {formatMiles(milesDriven)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Tenure</p>
              <p className="mt-0.5 truncate font-semibold text-white">
                {formatTenureYears(experienceYears)}
              </p>
            </div>
            <div className="col-span-2 min-w-0">
              <p className="text-zinc-500">Endorsements</p>
              <p
                className="mt-0.5 truncate font-semibold text-zinc-300"
                title={endorsements.length ? endorsementsLine : undefined}
              >
                {endorsementsLine}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Rating</p>
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
            <div className="col-span-3">
              <p className="text-zinc-500">Avail.</p>
              <p className="mt-0.5 truncate font-semibold text-white">
                {!available ? "—" : startLabel ? startLabel : "Immediate"}
              </p>
            </div>
          </div>
        : <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
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
        }
      </div>

      <div className={cn("flex flex-wrap gap-1.5", compact ? "mt-2" : "mt-4 gap-2")}>
        {(compact ? tags.slice(0, 2) : tags).map((label) => (
          <span
            key={label}
            className={cn(
              "rounded-full border border-zinc-700/80 bg-zinc-900/90 text-zinc-400",
              compact ? "max-w-[48%] truncate px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
            )}
            title={label}
          >
            {label}
          </span>
        ))}
        {compact && tags.length > 2 ?
          <span className="rounded-full border border-zinc-700/60 px-2 py-0.5 text-[10px] text-zinc-500">
            +{tags.length - 2}
          </span>
        : null}
      </div>

      <div className={cn("grid grid-cols-2 gap-2", compact ? "mt-2.5" : "mt-6 gap-3")}>
        <Link
          href={hireHref}
          className={cn(
            "flex items-center justify-center rounded-lg text-center font-semibold text-zinc-950",
            "bg-gradient-to-r from-emerald-300 to-emerald-600 transition hover:brightness-110 active:scale-[0.98]",
            compact ?
              "h-8 text-[11px] shadow-[0_4px_16px_-4px_rgba(16,185,129,0.45)]"
            : "h-11 rounded-xl text-sm shadow-[0_6px_28px_-6px_rgba(16,185,129,0.55)]"
          )}
        >
          Hire
        </Link>
        <Link
          href={view}
          className={cn(
            "flex items-center justify-center rounded-lg border border-zinc-600 bg-zinc-900/50 text-center font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-800/60 active:scale-[0.98]",
            compact ? "h-8 text-[11px]" : "h-11 rounded-xl text-sm"
          )}
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

export function DriverProfileCardSkeleton({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";
  return (
    <div
      className={cn(
        "border border-emerald-500/25 bg-[#0a0a0a]/90",
        compact ?
          "rounded-xl p-3 shadow-[0_0_20px_-12px_rgba(16,185,129,0.25)]"
        : "rounded-[1.25rem] p-6 shadow-[0_0_32px_-12px_rgba(16,185,129,0.25)]"
      )}
    >
      <div className="flex gap-2.5">
        <Skeleton
          className={cn("shrink-0 rounded-full", compact ? "h-9 w-9" : "h-16 w-16")}
        />
        <div className="flex-1 space-y-1.5 pt-0.5">
          <Skeleton className={cn(compact ? "h-4 w-32" : "h-5 w-40")} />
          <Skeleton className={cn("w-full max-w-[10rem]", compact ? "h-3" : "h-4")} />
          <Skeleton className={cn("rounded-full", compact ? "h-5 w-28" : "h-6 w-36")} />
        </div>
      </div>
      <div className={cn("border-t border-zinc-800/90", compact ? "mt-2.5 pt-2.5" : "mt-5 pt-5")}>
        <div
          className={cn(
            "grid gap-2",
            compact ? "grid-cols-3" : "grid-cols-2 gap-4"
          )}
        >
          {compact ?
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-10" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
              ))}
              <div className="col-span-2 space-y-1">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-3.5 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-3.5 w-8" />
              </div>
              <div className="col-span-3 space-y-1">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </>
          : <>
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
            </>
          }
        </div>
      </div>
      <div className={cn("flex gap-1.5", compact ? "mt-2" : "mt-4 gap-2")}>
        <Skeleton className={cn("rounded-full", compact ? "h-5 w-20" : "h-7 w-24")} />
        <Skeleton className={cn("rounded-full", compact ? "h-5 w-24" : "h-7 w-28")} />
      </div>
      <div className={cn("grid grid-cols-2 gap-2", compact ? "mt-2.5" : "mt-6 gap-3")}>
        <Skeleton className={cn(compact ? "h-8 rounded-lg" : "h-11 rounded-xl")} />
        <Skeleton className={cn(compact ? "h-8 rounded-lg" : "h-11 rounded-xl")} />
      </div>
    </div>
  );
}
