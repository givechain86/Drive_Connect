"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin } from "lucide-react";
import {
  fetchEmployerDirectoryEntry,
  fetchJobsByEmployer,
} from "@/lib/queries";
import { CompanyProfileCard } from "@/components/employers/company-profile-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import type { EmployerDirectoryEntry, Job } from "@/types";

function focusFromDescription(desc: string | null): string | null {
  if (!desc?.trim()) return null;
  const t = desc.trim().replace(/\s+/g, " ");
  return t.length > 72 ? `${t.slice(0, 72)}…` : t;
}

export default function EmployerPublicPage() {
  const params = useParams();
  const id = params.id as string;
  const authProfile = useAuthStore((s) => s.profile);

  const [employer, setEmployer] = useState<EmployerDirectoryEntry | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const contactHref = useMemo(() => {
    const next = `/messages?with=${id}`;
    if (authProfile?.role === "driver") return next;
    return `/login?next=${encodeURIComponent(next)}`;
  }, [authProfile?.role, id]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [e, j] = await Promise.all([
        fetchEmployerDirectoryEntry(id),
        fetchJobsByEmployer(id),
      ]);
      setEmployer(e);
      setJobs(j);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-[1.25rem]" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!employer) {
    return (
      <p className="px-4 py-8 text-zinc-400 sm:px-6">Company not found.</p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 animate-fade-in sm:px-6">
      <div className="mx-auto max-w-xl">
        <Link
          href="/employers"
          className="mb-3 inline-block text-sm text-emerald-400 hover:underline"
        >
          ← Companies
        </Link>
      </div>

      <div className="mx-auto max-w-xl">
        <CompanyProfileCard
          companyName={employer.company_name}
          subtitle={employer.location_preview ?? employer.profile?.full_name ?? null}
          hiring={employer.open_jobs_count > 0}
          openJobsCount={employer.open_jobs_count}
          focusLine={focusFromDescription(employer.company_description)}
          locationsLine={employer.location_preview}
          ratingAvg={employer.driver_rating_avg ?? null}
          ratingCount={employer.driver_rating_count ?? 0}
          showActions={false}
        />
      </div>

      {employer.company_description && (
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-medium text-zinc-400">About</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
            {employer.company_description}
          </p>
        </div>
      )}

      <section id="open-roles" className="mx-auto max-w-xl scroll-mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Open roles</h2>
        {jobs.length === 0 ? (
          <p className="text-zinc-500">No open listings right now.</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.id}`}>
                  <Card className="transition-transform hover:scale-[1.01]">
                    <CardHeader>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant="info">{job.shift}</Badge>
                      </div>
                      <CardTitle className="text-base">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {job.location}
                      </CardDescription>
                      <p className="pt-1 text-sm font-medium text-emerald-400">
                        {job.pay_rate}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mx-auto flex max-w-xl flex-wrap gap-2 pb-4">
        <Link href={contactHref}>
          <Button>Message company</Button>
        </Link>
        <Link href="/jobs">
          <Button variant="secondary">All jobs</Button>
        </Link>
      </div>
    </div>
  );
}
