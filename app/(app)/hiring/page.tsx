"use client";

import { useEffect, useState } from "react";
import { fetchEmployerApplications } from "@/lib/queries";
import { shouldUseMockData } from "@/lib/config";
import { getBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useMockStore } from "@/store/mock-store";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application, ApplicationStatus } from "@/types";

export default function HiringPage() {
  const profile = useAuthStore((s) => s.profile);
  const updateStatus = useMockStore((s) => s.updateApplicationStatus);
  const applications = useMockStore((s) => s.applications);

  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || profile.role !== "employer") return;
    void (async () => {
      setLoading(true);
      setRows(await fetchEmployerApplications(profile.id));
      setLoading(false);
    })();
  }, [profile, applications]);

  async function setApplicationStatus(id: string, status: ApplicationStatus) {
    setBusy(id);
    if (shouldUseMockData()) {
      updateStatus(id, status);
      setRows(await fetchEmployerApplications(profile!.id));
      setBusy(null);
      return;
    }
    const sb = getBrowserClient();
    if (!sb) {
      setBusy(null);
      return;
    }
    await sb.from("applications").update({ status }).eq("id", id);
    setRows(await fetchEmployerApplications(profile!.id));
    setBusy(null);
  }

  if (!profile || profile.role !== "employer") {
    return (
      <p className="text-zinc-400">This page is for employer accounts.</p>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Applicants</h1>
        <p className="text-zinc-400">
          Accept or reject candidates for your open roles.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>
            Drivers are notified when their status changes.
          </CardDescription>
        </CardHeader>
        <ul className="divide-y divide-zinc-800 px-5 pb-6">
          {rows.length === 0 && (
            <li className="py-8 text-center text-sm text-zinc-500">
              No applications yet.
            </li>
          )}
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-white">
                  {a.driver?.profile?.full_name ?? "Driver"}
                </p>
                <p className="text-sm text-zinc-400">{a.job?.title}</p>
                <p className="text-xs text-zinc-500">{a.job?.location}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                {a.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy === a.id}
                      onClick={() =>
                        void setApplicationStatus(a.id, "accepted")
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy === a.id}
                      onClick={() =>
                        void setApplicationStatus(a.id, "rejected")
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
