"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchNotifications } from "@/lib/queries";
import { shouldUseMockData } from "@/lib/config";
import { getBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useMockStore } from "@/store/mock-store";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const profile = useAuthStore((s) => s.profile);
  const mockNotifications = useMockStore((s) => s.notifications);
  const markRead = useMockStore((s) => s.markNotificationRead);

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setItems(await fetchNotifications(profile.id));
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useRealtimeNotifications(profile?.id, reload);

  async function onMarkRead(n: Notification) {
    if (n.read) return;
    if (shouldUseMockData()) {
      markRead(n.id);
      void reload();
      return;
    }
    const sb = getBrowserClient();
    if (!sb) return;
    await sb.from("notifications").update({ read: true }).eq("id", n.id);
    void reload();
  }

  if (!profile) return null;

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-zinc-400">
          Application updates and job alerts.{" "}
          {unread > 0 && (
            <Badge variant="warning" className="ml-2">
              {unread} unread
            </Badge>
          )}
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {items.length === 0 && (
            <Card className="p-8 text-center text-sm text-zinc-500">
              You are all caught up.
            </Card>
          )}
          {items.map((n) => (
            <li key={n.id}>
              <Card
                className={`cursor-pointer p-4 transition-colors ${
                  n.read ? "opacity-70" : "border-emerald-500/20 bg-emerald-500/5"
                }`}
                onClick={() => void onMarkRead(n)}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{n.title}</p>
                    {n.body && (
                      <p className="mt-1 text-sm text-zinc-400">{n.body}</p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatRelativeTime(n.created_at)} · {n.type}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  )}
                </div>
                {typeof n.meta?.job_id === "string" && (
                  <Link
                    href={`/jobs/${n.meta.job_id as string}`}
                    className="mt-3 inline-block text-sm text-emerald-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View job
                  </Link>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
