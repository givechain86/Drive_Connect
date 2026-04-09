"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import type { UserRole } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setSession = useAuthStore((s) => s.setSession);
  const mockMode = useAuthStore((s) => s.mockMode);

  const [role, setRole] = useState<UserRole>("driver");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (profile) router.replace("/dashboard");
  }, [user, profile, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    setError(null);
    if (shouldUseMockData() || mockMode) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const sb = getBrowserClient();
      if (!sb) throw new Error("No client");
      const { error: pErr } = await sb.from("profiles").insert({
        id: user.id,
        email: user.email,
        role,
        full_name: fullName || null,
      });
      if (pErr) {
        setError(pErr.message);
        setLoading(false);
        return;
      }
      if (role === "driver") {
        await sb.from("driver_profiles").insert({ user_id: user.id });
      } else {
        await sb.from("employer_profiles").insert({
          user_id: user.id,
          company_name: companyName || fullName || "Company",
        });
      }
      const newProfile = {
        id: user.id,
        email: user.email!,
        role,
        full_name: fullName || null,
      };
      setSession(user, newProfile, false);
      router.push("/dashboard");
    } catch {
      setError("Could not complete setup.");
    }
    setLoading(false);
  }

  if (!user || profile) return null;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Finish setup</CardTitle>
          <CardDescription>
            Tell us how you will use DriverConnect.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-5 pb-6">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(["driver", "employer"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  role === r
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                )}
              >
                {r === "driver" ? "Driver" : "Employer"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fn">Full name</Label>
            <Input
              id="fn"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          {role === "employer" && (
            <div className="space-y-2">
              <Label htmlFor="co">Company name</Label>
              <Input
                id="co"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
