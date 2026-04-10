"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchEmployers } from "@/lib/queries";
import {
  CompanyProfileCard,
  CompanyProfileCardSkeleton,
} from "@/components/employers/company-profile-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import type { EmployerDirectoryEntry } from "@/types";

function focusFromDescription(desc: string | null): string | null {
  if (!desc?.trim()) return null;
  const t = desc.trim().replace(/\s+/g, " ");
  return t.length > 72 ? `${t.slice(0, 72)}…` : t;
}

export default function EmployersPage() {
  const authProfile = useAuthStore((s) => s.profile);
  const [employers, setEmployers] = useState<EmployerDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const contactHrefFor = useMemo(() => {
    return (employerId: string) => {
      const next = `/messages?with=${employerId}`;
      if (authProfile?.role === "driver") return next;
      return `/login?next=${encodeURIComponent(next)}`;
    };
  }, [authProfile?.role]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setEmployers(await fetchEmployers());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6">
        {[1, 2, 3, 4].map((i) => (
          <CompanyProfileCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 animate-fade-in sm:px-6">
      <div>
        <Link
          href="/"
          className="mb-3 inline-block text-sm text-emerald-400 hover:underline"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-white">Companies</h1>
        <p className="text-zinc-400">
          Fleets on Drivers Job Hub — public directory. Drivers can sign in to
          message employers about open roles.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/login">
            <Button size="sm" variant="secondary">
              Driver log in
            </Button>
          </Link>
          <Link href="/drivers">
            <Button size="sm" variant="ghost" className="text-zinc-300">
              Browse drivers
            </Button>
          </Link>
          <Link href="/jobs">
            <Button size="sm" variant="ghost" className="text-zinc-300">
              Browse jobs
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {employers.map((e, i) => (
          <CompanyProfileCard
            key={e.user_id}
            companyName={e.company_name}
            subtitle={e.location_preview ?? e.profile?.full_name ?? null}
            hiring={e.open_jobs_count > 0}
            openJobsCount={e.open_jobs_count}
            focusLine={focusFromDescription(e.company_description)}
            locationsLine={e.location_preview}
            ratingAvg={e.driver_rating_avg ?? null}
            ratingCount={e.driver_rating_count ?? 0}
            jobsHref={`/employers/${e.user_id}`}
            contactHref={contactHrefFor(e.user_id)}
            style={{ animationDelay: `${i * 50}ms` }}
            className="animate-fade-in"
          />
        ))}
      </div>
      {employers.length === 0 && (
        <p className="text-zinc-500">No companies listed yet.</p>
      )}
    </div>
  );
}
