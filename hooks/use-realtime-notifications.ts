"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { resolveBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";

export function useRealtimeNotifications(
  userId: string | undefined,
  onEvent: () => void
) {
  useEffect(() => {
    if (!userId || shouldUseMockData()) return;
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    void (async () => {
      const sb = await resolveBrowserClient();
      if (cancelled || !sb) return;
      const ch = sb
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => onEvent()
        )
        .subscribe();
      if (cancelled) {
        void sb.removeChannel(ch);
        return;
      }
      channel = ch;
    })();

    return () => {
      cancelled = true;
      void (async () => {
        const sb = await resolveBrowserClient();
        if (channel && sb) void sb.removeChannel(channel);
      })();
    };
  }, [userId, onEvent]);
}
