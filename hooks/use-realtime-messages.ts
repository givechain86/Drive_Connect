"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";

export function useRealtimeMessages(
  userId: string | undefined,
  onEvent: () => void
) {
  useEffect(() => {
    if (!userId || shouldUseMockData()) return;
    const sb = getBrowserClient();
    if (!sb) return;
    const channel = sb
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const row = payload.new as { sender_id?: string; receiver_id?: string };
          if (row.sender_id === userId || row.receiver_id === userId) {
            onEvent();
          }
        }
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [userId, onEvent]);
}
