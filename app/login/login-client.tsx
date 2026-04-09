"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const setMockPersona = useAuthStore((s) => s.setMockPersona);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Something went wrong. Try again." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (shouldUseMockData()) {
        setError("Configure Supabase env vars, or use demo mode below.");
        setLoading(false);
        return;
      }
      const sb = getBrowserClient();
      if (!sb) throw new Error("No client");
      const { error: err } = await sb.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Sign-in failed.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Log in to DriverConnect with your email and password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-5 pb-6">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {shouldUseMockData() && (
          <div className="border-t border-zinc-800 px-5 py-4">
            <p className="mb-3 text-xs text-zinc-500">
              No Supabase keys detected — explore the UI with mock personas:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMockPersona("driver");
                  router.push("/dashboard");
                }}
              >
                Demo as driver
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMockPersona("employer");
                  router.push("/dashboard");
                }}
              >
                Demo as employer
              </Button>
            </div>
          </div>
        )}
        <p className="border-t border-zinc-800 px-5 py-4 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
