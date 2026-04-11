"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchDrivers } from "@/lib/queries";
import { inferCdlClass } from "@/lib/driver-fields";
import {
  DriverProfileCard,
  DriverProfileCardSkeleton,
} from "@/components/drivers/driver-profile-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import type { DriverProfile, Profile } from "@/types";

export default function DriversPage() {
  const authProfile = useAuthStore((s) => s.profile);
  const [drivers, setDrivers] = useState<
    (DriverProfile & { profile: Profile })[]
  >([]);
  const [loading, setLoading] = useState(true);

  const hireHrefFor = useMemo(() => {
    return (driverId: string) => {
      const next = `/messages?with=${driverId}`;
      if (authProfile?.role === "employer") return next;
      return `/login?next=${encodeURIComponent(next)}`;
    };
  }, [authProfile?.role]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setDrivers(await fetchDrivers());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <DriverProfileCardSkeleton key={i} variant="compact" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <Link
          href="/"
          className="mb-3 inline-block text-sm text-emerald-400 hover:underline"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-white">Drivers</h1>
        <p className="text-zinc-400">
          Open directory — no account required. Employers can sign in to message
          drivers or post jobs.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/login">
            <Button size="sm" variant="secondary">
              Employer log in
            </Button>
          </Link>
          <Link href="/jobs">
            <Button size="sm" variant="ghost" className="text-zinc-300">
              Browse jobs
            </Button>
          </Link>
          <Link href="/employers">
            <Button size="sm" variant="ghost" className="text-zinc-300">
              Browse companies
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((d, i) => (
          <DriverProfileCard
            key={d.user_id}
            variant="compact"
            driverId={d.user_id}
            fullName={d.profile.full_name ?? "Driver"}
            location={d.location_name}
            available={d.availability}
            experienceYears={d.experience_years}
            licenseType={d.license_type}
            cdlClass={inferCdlClass(d.license_type, d.cdl_class)}
            endorsements={d.endorsements ?? []}
            milesDriven={d.miles_driven ?? null}
            backgroundCheckVerified={d.background_check_verified ?? false}
            willingToRelocate={d.willing_to_relocate ?? false}
            availabilityStartsAt={d.availability_starts_at ?? null}
            ratingAvg={d.employer_rating_avg ?? null}
            ratingCount={d.employer_rating_count ?? 0}
            hireHref={hireHrefFor(d.user_id)}
            style={{ animationDelay: `${i * 50}ms` }}
            className="animate-fade-in"
          />
        ))}
      </div>
    </div>
  );
}
