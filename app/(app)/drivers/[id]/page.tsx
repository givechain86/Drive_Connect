"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import { fetchDriverProfile } from "@/lib/queries";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
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

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const d = await fetchDriverProfile(id);
      setDriver(d);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!driver || !profile || profile.role !== "employer") return;
    if (shouldUseMockData()) return;
    const sb = getBrowserClient();
    void sb?.rpc("increment_driver_profile_views", { target: id });
  }, [driver, profile, id]);

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
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={driver.availability ? "success" : "default"}>
              {driver.availability ? "Available" : "Not available"}
            </Badge>
            {driver.license_type && (
              <Badge variant="info">{driver.license_type}</Badge>
            )}
            <span className="text-sm text-zinc-500">
              {driver.experience_years} years experience
            </span>
          </div>
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
      </Card>
    </div>
  );
}
