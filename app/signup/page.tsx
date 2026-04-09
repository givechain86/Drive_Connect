"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("driver");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (shouldUseMockData()) {
      setError("Add Supabase URL and anon key to .env.local to create a real account.");
      return;
    }
    setLoading(true);
    try {
      const sb = getBrowserClient();
      if (!sb) throw new Error("No client");
      const { data, error: signErr } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signErr) {
        setError(signErr.message);
        setLoading(false);
        return;
      }
      const user = data.user;
      if (!user) {
        setError("Check your email to confirm your account, then sign in.");
        setLoading(false);
        return;
      }
      const { error: pErr } = await sb.from("profiles").insert({
        id: user.id,
        email,
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
          company_name: fullName || "My company",
        });
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Sign-up failed.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Choose whether you are hiring or looking for driving work.
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
            <Label htmlFor="name">
              {role === "employer" ? "Your name" : "Full name"}
            </Label>
            <Input
              id="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={
                role === "employer" ? "Contact name" : "Alex Rivera"
              }
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="border-t border-zinc-800 px-5 py-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
