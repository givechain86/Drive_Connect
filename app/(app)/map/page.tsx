"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, MapPin, Truck } from "lucide-react";
import { fetchDrivers, fetchJobs } from "@/lib/queries";
import { DriversMap } from "@/components/map/drivers-map";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { jobHasMapPin } from "@/lib/job-map-coords";
import type { DriverProfile, Job, Profile } from "@/types";

export default function MapPage() {
  const [drivers, setDrivers] = useState<
    (DriverProfile & { profile: Profile })[]
  >([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const [d, j] = await Promise.all([fetchDrivers(), fetchJobs()]);
      setDrivers(d);
      setJobs(j);
    })();
  }, []);

  const jobsOnMap = useMemo(
    () => jobs.filter((j) => jobHasMapPin(j)),
    [jobs]
  );

  const driversOnMap = useMemo(() => {
    return drivers.filter(
      (d) =>
        d.lat != null &&
        d.lng != null &&
        (!onlyAvailable || d.availability)
    );
  }, [drivers, onlyAvailable]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Live map</h1>
        <p className="text-zinc-400">
          Light basemap with bubble pins — drivers (green) and open jobs
          (orange). Click a pin for details.
        </p>
      </div>
      <Card className="overflow-hidden p-0">
        <CardHeader className="p-5 pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Drivers & jobs</CardTitle>
              <CardDescription>
                Pins show short codes (initials or title abbrev). Job pins
                appear when listings include coordinates.
              </CardDescription>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600"
              />
              <Label className="cursor-pointer font-normal">
                Available drivers only
              </Label>
            </label>
          </div>
        </CardHeader>
        <div className="relative px-2 pb-2 sm:px-4 sm:pb-4">
          <DriversMap
            drivers={drivers}
            jobs={jobs}
            onlyAvailable={onlyAvailable}
          />
          <div className="pointer-events-none absolute left-4 top-4 z-[2000] max-w-[min(100%-2rem,320px)] rounded-2xl border border-zinc-200/90 bg-white/95 px-4 py-2.5 text-xs text-zinc-700 shadow-xl backdrop-blur-sm sm:left-6 sm:top-6 sm:text-sm">
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-zinc-800">
              <Truck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{driversOnMap.length} drivers</span>
              <span className="text-zinc-400">·</span>
              <BriefcaseBusiness className="h-4 w-4 shrink-0 text-orange-600" />
              <span>{jobsOnMap.length} jobs on map</span>
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-12 left-4 z-[2000] rounded-xl border border-zinc-200/90 bg-white/95 px-3 py-2.5 text-[11px] shadow-lg backdrop-blur-sm sm:bottom-14 sm:left-6 sm:text-xs">
            <p className="mb-1.5 font-semibold text-zinc-800">Legend</p>
            <div className="flex flex-col gap-2 text-zinc-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-800" />
                Driver (green) — available
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gradient-to-br from-stone-400 to-stone-700" />
                Driver — unavailable
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gradient-to-br from-orange-400 to-orange-800" />
                Open job
              </span>
            </div>
            <p className="mt-2 border-t border-zinc-200 pt-2 text-[10px] leading-snug text-zinc-500">
              Map data © OpenStreetMap © CARTO
            </p>
          </div>
        </div>
      </Card>
      <p className="text-center text-sm text-zinc-500">
        <MapPin className="mr-1 inline-block h-4 w-4 align-text-bottom text-zinc-600" />
        Explore the public{" "}
        <Link href="/drivers" className="text-emerald-400 hover:underline">
          driver directory
        </Link>{" "}
        and{" "}
        <Link href="/jobs" className="text-emerald-400 hover:underline">
          job board
        </Link>
        .
      </p>
    </div>
  );
}
