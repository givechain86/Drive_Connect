"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { mockJobs } from "@/lib/mock-data";
import type { JobShift } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewJobPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [payRate, setPayRate] = useState("");
  const [shift, setShift] = useState<JobShift>("day");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (profile?.role !== "employer") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employers only</CardTitle>
          <CardDescription>
            Only company accounts can post jobs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setLoading(true);
    if (shouldUseMockData()) {
      mockJobs.unshift({
        id: `mock-job-${Date.now()}`,
        employer_id: profile.id,
        title,
        location,
        pay_rate: payRate,
        shift,
        description: description || null,
        created_at: new Date().toISOString(),
      });
      router.push("/jobs");
      setLoading(false);
      return;
    }
    const sb = await resolveBrowserClient();
    if (!sb) {
      setError("Supabase not configured.");
      setLoading(false);
      return;
    }
    const { error: err } = await sb.from("jobs").insert({
      employer_id: profile.id,
      title,
      location,
      pay_rate: payRate,
      shift,
      description: description || null,
    });
    if (err) setError(err.message);
    else router.push("/jobs");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <h1 className="mb-2 text-2xl font-bold text-white">Post a job</h1>
      <p className="mb-6 text-zinc-400">
        Drivers browsing the marketplace will see this listing immediately.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
          <CardDescription>Be specific about shift and compensation.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-5 pb-6">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Regional CDL-A Driver"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, ST"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay">Pay rate</Label>
            <Input
              id="pay"
              required
              value={payRate}
              onChange={(e) => setPayRate(e.target.value)}
              placeholder="$28–32/hr"
            />
          </div>
          <div className="space-y-2">
            <Label>Shift</Label>
            <div className="flex flex-wrap gap-2">
              {(["day", "night", "flexible"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShift(s)}
                  className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                    shift === s
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Route types, equipment, requirements…"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Publishing…" : "Publish job"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
