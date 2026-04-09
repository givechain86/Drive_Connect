"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { fetchJob } from "@/lib/queries";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { useMockStore } from "@/store/mock-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Job } from "@/types";

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const addApplication = useMockStore((s) => s.addApplication);
  const addNotification = useMockStore((s) => s.addNotification);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyState, setApplyState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setJob(await fetchJob(id));
      setLoading(false);
    })();
  }, [id]);

  async function apply() {
    if (!profile || profile.role !== "driver" || !job) {
      router.push("/login");
      return;
    }
    setApplyState("loading");
    setMsg(null);
    if (shouldUseMockData()) {
      const newApp = {
        id: `mock-app-${Date.now()}`,
        job_id: job.id,
        driver_id: profile.id,
        status: "pending" as const,
        created_at: new Date().toISOString(),
        job,
      };
      addApplication(newApp);
      addNotification({
        id: `n-${Date.now()}`,
        user_id: job.employer_id,
        type: "new_application",
        title: "New applicant",
        body: `${profile.full_name ?? "A driver"} applied to ${job.title}`,
        read: false,
        meta: { job_id: job.id },
        created_at: new Date().toISOString(),
      });
      setApplyState("done");
      setMsg("Application sent.");
      return;
    }
    const sb = getBrowserClient();
    if (!sb) {
      setApplyState("error");
      setMsg("Not configured.");
      return;
    }
    const { error } = await sb.from("applications").insert({
      job_id: job.id,
      driver_id: profile.id,
      status: "pending",
    });
    if (error) {
      setApplyState("error");
      setMsg(error.message);
      return;
    }
    setApplyState("done");
    setMsg("Application sent.");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-zinc-400">Job not found.</p>
        <Link href="/jobs" className="mt-4 inline-block text-emerald-400">
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/jobs"
        className="mb-6 inline-block text-sm text-emerald-400 hover:underline"
      >
        ← All jobs
      </Link>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="info">{job.shift}</Badge>
          </div>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-base">
            <MapPin className="h-4 w-4" />
            {job.location}
          </CardDescription>
          <p className="text-lg font-semibold text-emerald-400">{job.pay_rate}</p>
        </CardHeader>
        <div className="border-t border-zinc-800 px-5 py-5">
          <h3 className="mb-2 text-sm font-medium text-zinc-300">Description</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
            {job.description ?? "No description provided."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 px-5 py-5">
          {profile?.role === "driver" ? (
            <>
              <Button
                onClick={() => void apply()}
                disabled={applyState === "loading" || applyState === "done"}
              >
                {applyState === "done" ? "Applied" : "Apply now"}
              </Button>
              {msg && (
                <span
                  className={
                    applyState === "error" ? "text-red-400" : "text-emerald-400"
                  }
                >
                  {msg}
                </span>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              <Link href="/login" className="text-emerald-400">
                Sign in as a driver
              </Link>{" "}
              to apply.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
