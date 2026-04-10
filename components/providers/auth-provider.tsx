"use client";

import { useEffect, useRef } from "react";
import type {
  AuthChangeEvent,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { resolveBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types";

async function fetchProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,full_name,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

/** Reuse store profile for this user when a refetch returns null (transient RLS/network). */
function profileForUser(user: User, fetched: Profile | null): Profile | null {
  if (fetched) return fetched;
  const { user: u, profile: p } = useAuthStore.getState();
  if (u?.id === user.id && p?.id === user.id) return p;
  return null;
}

function shouldClearSession(event: AuthChangeEvent): boolean {
  return event === "SIGNED_OUT";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const { mockMode, user: mockUser } = useAuthStore.getState();
    if (mockMode && mockUser) {
      useAuthStore.setState({ initialized: true });
      return;
    }

    void (async () => {
      const supabase = await resolveBrowserClient();
      if (cancelled) return;

      if (!supabase) {
        setSession(null, null, false);
        return;
      }

      const sync = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setSession(null, null, false);
          return;
        }
        const fetched = await fetchProfile(supabase, user.id);
        if (cancelled) return;
        setSession(user, profileForUser(user, fetched), false);
      };

      await sync();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        void (async () => {
          if (!session?.user) {
            if (shouldClearSession(event)) {
              setSession(null, null, false);
            }
            return;
          }
          const fetched = await fetchProfile(supabase, session.user.id);
          setSession(
            session.user,
            profileForUser(session.user, fetched),
            false
          );
        })();
      });

      subRef.current = subscription;
    })();

    return () => {
      cancelled = true;
      subRef.current?.unsubscribe();
      subRef.current = null;
    };
  }, [setSession]);

  return <>{children}</>;
}
