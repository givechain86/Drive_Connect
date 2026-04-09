"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types";

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,full_name,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (shouldUseMockData()) {
      useAuthStore.setState((s) => ({
        initialized: true,
        mockMode: true,
        user: s.user,
        profile: s.profile,
      }));
      return;
    }

    const supabase = getBrowserClient();
    if (!supabase) {
      setSession(null, null, false);
      return;
    }

    let cancelled = false;

    const sync = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setSession(null, null, false);
        return;
      }
      const profile = await fetchProfile(user.id);
      setSession(user, profile, false);
    };

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!session?.user) {
          setSession(null, null, false);
          return;
        }
        const profile = await fetchProfile(session.user.id);
        setSession(session.user, profile, false);
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}
