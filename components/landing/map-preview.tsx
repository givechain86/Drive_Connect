"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "@/components/map/map-bubbles.css";
import { Map } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  LandingMapDriverPin,
  LandingMapJobPin,
} from "@/lib/landing-preview";

const Inner = dynamic(
  () =>
    import("@/components/landing/map-preview-inner").then((m) => m.MapPreviewInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(320px,55vh)] min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <Skeleton className="h-full w-full min-h-[200px] rounded-xl" />
        <p className="text-xs text-zinc-500">Loading map…</p>
      </div>
    ),
  }
);

type Props = {
  drivers: LandingMapDriverPin[];
  jobs: LandingMapJobPin[];
  empty?: boolean;
};

export function MapPreview({ drivers, jobs, empty }: Props) {
  if (empty || (drivers.length === 0 && jobs.length === 0)) {
    return (
      <div className="flex h-[min(280px,50vh)] min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
        <Map className="h-10 w-10 text-zinc-600" />
        <p className="max-w-sm text-sm text-zinc-400">
          No pins to show yet — be the first to join and appear on the live map.
        </p>
        <Link
          href="/signup"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-sm font-medium text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
        >
          Create an account
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/90 shadow-[0_0_48px_-12px_rgba(16,185,129,0.2)]">
      <Inner drivers={drivers} jobs={jobs} />
      <div className="pointer-events-none absolute left-3 top-3 z-[500] max-w-[min(100%-1.5rem,280px)] rounded-2xl border border-zinc-200/90 bg-white/95 px-3 py-2 text-xs text-zinc-700 shadow-lg backdrop-blur-sm sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          Drivers & jobs on the map — tap a bubble for details
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-10 left-3 z-[500] rounded-xl border border-zinc-200/90 bg-white/95 px-3 py-2 text-[11px] shadow-md backdrop-blur-sm sm:text-xs">
        <p className="mb-1.5 font-semibold text-zinc-700">Legend</p>
        <div className="flex flex-col gap-1.5 text-zinc-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-sm" />
            Drivers (available)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gradient-to-br from-orange-400 to-orange-700 shadow-sm" />
            Open jobs
          </span>
        </div>
      </div>
    </div>
  );
}
