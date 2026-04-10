"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import {
  fetchDriverProfile,
  fetchEmployerApplications,
} from "@/lib/queries";
import { formatMiles, inferCdlClass } from "@/lib/driver-fields";
import { fetchMyDriverRatingForDriver } from "@/lib/ratings";
import { resolveBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { RateDriverPanel } from "@/components/rating/rate-driver-panel";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DriverProfile, Profile } from "@/types";

export default function DriverPublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const profile = useAuthStore((s) => s.profile);

  const [driver, setDriver] = useState<
    (DriverProfile & { profile: Profile }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [canRateAsEmployer, setCanRateAsEmployer] = useState(false);
  const [myRating, setMyRating] = useState<{
    score: number;
    comment: string | null;
  } | null>(null);

  const reloadDriver = useCallback(async () => {
    const d = await fetchDriverProfile(id);
    setDriver(d);
  }, [id]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await reloadDriver();
      setLoading(false);
    })();
  }, [reloadDriver]);

  useEffect(() => {
    if (!driver || !profile || profile.role !== "employer") return;
    if (shouldUseMockData()) return;
    let cancelled = false;
    void (async () => {
      const sb = await resolveBrowserClient();
      if (cancelled || !sb) return;
      void sb.rpc("increment_driver_profile_views", { target: id });
    })();
    return () => {
      cancelled = true;
    };
  }, [driver, profile, id]);

  useEffect(() => {
    if (!driver || !profile || profile.role !== "employer") {
      setCanRateAsEmployer(false);
      setMyRating(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const apps = await fetchEmployerApplications(profile.id);
      if (cancelled) return;
      const can = apps.some(
        (a) => a.driver_id === driver.user_id && a.status === "accepted"
      );
      setCanRateAsEmployer(can);
      const mine = await fetchMyDriverRatingForDriver(
        profile.id,
        driver.user_id
      );
      if (!cancelled) setMyRating(mine);
    })();
    return () => {
      cancelled = true;
    };
  }, [driver, profile]);

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!driver) {
    return <p className="text-zinc-400">Driver not found.</p>;
  }

  const chatWith = profile?.role === "employer" ? driver.user_id : null;
  const loginNext = `/login?next=${encodeURIComponent(`/drivers/${id}`)}`;
  const inferredCdl = inferCdlClass(driver.license_type, driver.cdl_class);

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <Link
        href="/drivers"
        className="mb-4 inline-block text-sm text-emerald-400 hover:underline"
      >
        ← All drivers
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {driver.profile.full_name ?? "Driver"}
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {driver.location_name ?? "—"}
          </CardDescription>
          <StarRatingDisplay
            avg={driver.employer_rating_avg ?? null}
            count={driver.employer_rating_count ?? 0}
            className="pt-2"
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={driver.availability ? "success" : "default"}>
              {driver.availability ? "Available" : "Not available"}
            </Badge>
            {driver.background_check_verified && (
              <Badge variant="success">✅ Background check</Badge>
            )}
            {inferredCdl && (
              <Badge variant="info">CDL {inferredCdl}</Badge>
            )}
            {driver.license_type && !inferredCdl && (
              <Badge variant="info">{driver.license_type}</Badge>
            )}
            <span className="text-sm text-zinc-500">
              {formatMiles(driver.miles_driven)} · {driver.experience_years} yrs
            </span>
          </div>
          {(driver.endorsements?.length ?? 0) > 0 && (
            <p className="pt-2 text-sm text-zinc-400">
              Endorsements: {(driver.endorsements ?? []).join(", ")}
            </p>
          )}
          {(driver.willing_to_relocate || driver.availability_starts_at) && (
            <p className="pt-1 text-sm text-zinc-500">
              {driver.willing_to_relocate && "Open to relocate. "}
              {driver.availability_starts_at &&
                `Available from ${driver.availability_starts_at}.`}
            </p>
          )}
        </CardHeader>
        <div className="border-t border-zinc-800 px-5 py-4">
          <p className="text-sm text-zinc-400">
            Phone: {driver.phone ?? "Not shared"}
          </p>
          {driver.cv_url && (
            <a
              href={driver.cv_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-emerald-400 hover:underline"
            >
              View CV
            </a>
          )}
        </div>
        {profile && chatWith && (
          <div className="border-t border-zinc-800 px-5 py-4">
            <Link href={`/messages?with=${chatWith}`}>
              <Button variant="secondary" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
            </Link>
          </div>
        )}
        {!profile && (
          <div className="border-t border-zinc-800 px-5 py-4">
            <p className="mb-2 text-sm text-zinc-500">
              Employers: sign in to message this driver.
            </p>
            <Link href={loginNext}>
              <Button variant="secondary" size="sm">
                Log in as employer
              </Button>
            </Link>
          </div>
        )}
        {profile?.role === "employer" && canRateAsEmployer && (
          <RateDriverPanel
            employerId={profile.id}
            driverId={driver.user_id}
            initial={myRating}
            publicAvg={driver.employer_rating_avg ?? null}
            publicCount={driver.employer_rating_count ?? 0}
            onSaved={() => void reloadDriver()}
          />
        )}
      </Card>
    </div>
  );
}
