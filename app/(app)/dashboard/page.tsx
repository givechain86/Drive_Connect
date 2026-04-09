"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Eye,
  FileText,
  Send,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchDrivers,
  fetchEmployerApplications,
  fetchJobs,
  fetchMyApplications,
} from "@/lib/queries";
import { useMockStore } from "@/store/mock-store";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application, Job } from "@/types";

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const mockApplications = useMockStore((s) => s.applications);
  const [loading, setLoading] = useState(true);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [employerApps, setEmployerApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const j = await fetchJobs();
      if (cancelled) return;
      setJobs(j);
      if (profile.role === "driver") {
        const apps = await fetchMyApplications(profile.id);
        setMyApps(apps);
        const drivers = await fetchDrivers();
        const me = drivers.find((d) => d.user_id === profile.id);
        setViews(me?.profile_views ?? 0);
      } else {
        const apps = await fetchEmployerApplications(profile.id);
        setEmployerApps(apps);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, mockApplications]);

  if (!profile) return null;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (profile.role === "driver") {
    const pending = myApps.filter((a) => a.status === "pending").length;
    const accepted = myApps.filter((a) => a.status === "accepted").length;
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver dashboard</h1>
          <p className="text-zinc-400">
            Track applications and how often employers view your profile.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Send className="mb-1 h-6 w-6 text-emerald-400" />
              <CardTitle className="text-2xl font-bold">{myApps.length}</CardTitle>
              <CardDescription>Applications sent</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="mb-1 h-6 w-6 text-amber-400" />
              <CardTitle className="text-2xl font-bold">{pending}</CardTitle>
              <CardDescription>Pending review</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Eye className="mb-1 h-6 w-6 text-sky-400" />
              <CardTitle className="text-2xl font-bold">{views}</CardTitle>
              <CardDescription>Profile views</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent applications</CardTitle>
              <CardDescription>
                {accepted} accepted · {myApps.length - pending - accepted}{" "}
                other
              </CardDescription>
            </div>
            <Link href="/jobs">
              <Button size="sm" variant="secondary">
                Browse jobs
              </Button>
            </Link>
          </CardHeader>
          <ul className="divide-y divide-zinc-800 px-5 pb-5">
            {myApps.length === 0 && (
              <li className="py-6 text-center text-sm text-zinc-500">
                No applications yet.
              </li>
            )}
            {myApps.slice(0, 6).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {a.job?.title ?? "Job"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {a.job?.location}
                  </p>
                </div>
                <Badge
                  variant={
                    a.status === "accepted"
                      ? "success"
                      : a.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {a.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const myJobs = jobs.filter((j) => j.employer_id === profile.id);
  const pendingApps = employerApps.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employer dashboard</h1>
          <p className="text-zinc-400">
            Open roles, applicants, and hiring progress.
          </p>
        </div>
        <Link href="/jobs/new">
          <Button>Post a job</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <Briefcase className="mb-1 h-6 w-6 text-emerald-400" />
            <CardTitle className="text-2xl font-bold">{myJobs.length}</CardTitle>
            <CardDescription>Active listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Users className="mb-1 h-6 w-6 text-amber-400" />
            <CardTitle className="text-2xl font-bold">
              {employerApps.length}
            </CardTitle>
            <CardDescription>Total applicants</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <FileText className="mb-1 h-6 w-6 text-sky-400" />
            <CardTitle className="text-2xl font-bold">{pendingApps}</CardTitle>
            <CardDescription>Awaiting your decision</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Latest applicants</CardTitle>
            <CardDescription>Accept or reject from each job post.</CardDescription>
          </div>
          <Link href="/drivers">
            <Button size="sm" variant="secondary">
              Browse drivers
            </Button>
          </Link>
        </CardHeader>
        <ul className="divide-y divide-zinc-800 px-5 pb-5">
          {employerApps.length === 0 && (
            <li className="py-6 text-center text-sm text-zinc-500">
              No applicants yet. Share your job posts or browse drivers.
            </li>
          )}
          {employerApps.slice(0, 8).map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-medium text-white">
                  {a.driver?.profile?.full_name ?? "Driver"} ·{" "}
                  {a.job?.title}
                </p>
                <p className="text-xs text-zinc-500">{a.job?.location}</p>
              </div>
              <Badge
                variant={
                  a.status === "accepted"
                    ? "success"
                    : a.status === "rejected"
                      ? "danger"
                      : "warning"
                }
              >
                {a.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
