"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, User } from "lucide-react";
import { fetchDrivers } from "@/lib/queries";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { DriverProfile, Profile } from "@/types";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<
    (DriverProfile & { profile: Profile })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setDrivers(await fetchDrivers());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Drivers</h1>
        <p className="text-zinc-400">
          Browse verified driver profiles and open a chat thread.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {drivers.map((d, i) => (
          <Link key={d.user_id} href={`/drivers/${d.user_id}`}>
            <Card
              className="h-full transition-transform hover:scale-[1.01]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  <CardTitle className="text-lg">
                    {d.profile.full_name ?? "Driver"}
                  </CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {d.location_name ?? "Location not set"}
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant={d.availability ? "success" : "default"}>
                    {d.availability ? "Available" : "Not available"}
                  </Badge>
                  {d.license_type && (
                    <Badge variant="info">{d.license_type}</Badge>
                  )}
                  <span className="text-xs text-zinc-500">
                    {d.experience_years} yrs exp.
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
