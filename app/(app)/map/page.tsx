"use client";

import { useEffect, useState } from "react";
import { fetchDrivers } from "@/lib/queries";
import { DriversMap } from "@/components/map/drivers-map";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DriverProfile, Profile } from "@/types";

export default function MapPage() {
  const [drivers, setDrivers] = useState<
    (DriverProfile & { profile: Profile })[]
  >([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      setDrivers(await fetchDrivers());
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Driver map</h1>
        <p className="text-zinc-400">
          Leaflet + OpenStreetMap. Filter to drivers who marked themselves
          available.
        </p>
      </div>
      <Card className="overflow-hidden p-0">
        <CardHeader className="p-5 pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Live locations</CardTitle>
              <CardDescription>
                Pins use lat/lng from each driver profile.
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
                Available only
              </Label>
            </label>
          </div>
        </CardHeader>
        <div className="px-2 pb-2 sm:px-4 sm:pb-4">
          <DriversMap drivers={drivers} onlyAvailable={onlyAvailable} />
        </div>
      </Card>
    </div>
  );
}
