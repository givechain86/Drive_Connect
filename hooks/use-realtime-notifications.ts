"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";

export function useRealtimeNotifications(
  userId: string | undefined,
  onEvent: () => void
) {
  useEffect(() => {
    if (!userId || shouldUseMockData()) return;
    const sb = getBrowserClient();
    if (!sb) return;
    const channel = sb
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
    return () => {
      void sb.removeChannel(channel);
    };
  }, [userId, onEvent]);
}
