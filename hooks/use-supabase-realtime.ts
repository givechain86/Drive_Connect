"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";

export function useMessagesRealtime(
  userId: string | undefined,
  onEvent: () => void
) {
  useEffect(() => {
    if (shouldUseMockData() || !userId) return;
    const sb = getBrowserClient();
    if (!sb) return;

    const ch = sb
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => onEvent()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${userId}`,
        },
        () => onEvent()
      )
      .subscribe();

    return () => {
      void sb.removeChannel(ch);
    };
  }, [userId, onEvent]);
}

export function useNotificationsRealtime(
  userId: string | undefined,
  onEvent: () => void
) {
  useEffect(() => {
    if (shouldUseMockData() || !userId) return;
    const sb = getBrowserClient();
    if (!sb) return;

    const ch = sb
      .channel(`notif-${userId}`)
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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => onEvent()
      )
      .subscribe();

    return () => {
      void sb.removeChannel(ch);
    };
  }, [userId, onEvent]);
}
