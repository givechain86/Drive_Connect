"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "@/components/map/map-bubbles.css";
import type { DriverProfile, Job, Profile } from "@/types";

const Inner = dynamic(
  () =>
    import("@/components/map/drivers-map-inner").then((m) => m.DriversMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500">
        Loading map…
      </div>
    ),
  }
);

type Props = {
  drivers: (DriverProfile & { profile: Profile })[];
  jobs?: Job[];
  onlyAvailable: boolean;
};

export function DriversMap({ drivers, jobs = [], onlyAvailable }: Props) {
  return <Inner drivers={drivers} jobs={jobs} onlyAvailable={onlyAvailable} />;
}
