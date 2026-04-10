"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Sun, Moon, Clock } from "lucide-react";
import { fetchJobs } from "@/lib/queries";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { Job, JobShift } from "@/types";

function shiftIcon(shift: JobShift) {
  if (shift === "day") return Sun;
  if (shift === "night") return Moon;
  return Clock;
}

export default function JobsPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const signedIn = Boolean(user && profile);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setJobs(await fetchJobs());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 animate-fade-in">
        {!signedIn && (
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            ← Home
          </Link>
        )}
        <h1 className="text-3xl font-bold text-white">Open positions</h1>
        <p className="mt-2 text-zinc-400">
          CDL and commercial driving roles from fleets on Drivers Job Hub.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/employers">
            <Button size="sm" variant="ghost" className="text-zinc-300">
              Browse companies
            </Button>
          </Link>
          {!signedIn && (
            <Link href="/login">
              <Button size="sm" variant="secondary">
                Sign in to apply
              </Button>
            </Link>
          )}
        </div>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => {
            const Icon = shiftIcon(job.shift);
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card
                  className="h-full animate-fade-in transition-transform hover:scale-[1.01]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <CardHeader>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="info">{job.shift}</Badge>
                      <Icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <CardTitle className="line-clamp-2">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {job.location}
                    </CardDescription>
                    <p className="pt-2 text-sm font-medium text-emerald-400">
                      {job.pay_rate}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
