"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  fetchConversation,
  fetchEmployerApplications,
  fetchMyApplications,
  getMockEmployerId,
} from "@/lib/queries";
import { shouldUseMockData } from "@/lib/config";
import { getBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useMockStore } from "@/store/mock-store";
import { mockDriverProfiles } from "@/lib/mock-data";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import type { Message } from "@/types";

export function MessagesClient() {
  const searchParams = useSearchParams();
  const profile = useAuthStore((s) => s.profile);
  const mockApplications = useMockStore((s) => s.applications);
  const addMessage = useMockStore((s) => s.addMessage);

  const [otherId, setOtherId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [supabasePeers, setSupabasePeers] = useState<
    { id: string; label: string }[]
  >([]);

  const withParam = searchParams.get("with");

  const suggestions = useMemo(() => {
    if (!profile) return [];
    if (shouldUseMockData()) {
      if (profile.role === "driver") {
        return [{ id: getMockEmployerId(), label: "MetroHaul Logistics" }];
      }
      const drivers = new Map<string, string>();
      mockApplications.forEach((a) => {
        const name =
          mockDriverProfiles.find((d) => d.user_id === a.driver_id)?.profile
            .full_name ?? "Driver";
        drivers.set(a.driver_id, name);
      });
      return [...drivers.entries()].map(([id, label]) => ({ id, label }));
    }
    return supabasePeers;
  }, [profile, mockApplications, supabasePeers]);

  useEffect(() => {
    if (!profile) return;
    const initial = withParam ?? suggestions[0]?.id ?? null;
    setOtherId(initial);
  }, [profile, withParam, suggestions]);

  const reload = useCallback(async () => {
    if (!profile || !otherId) return;
    setLoading(true);
    setThread(await fetchConversation(profile.id, otherId));
    setLoading(false);
  }, [profile, otherId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useRealtimeMessages(profile?.id, reload);

  useEffect(() => {
    if (!profile || shouldUseMockData()) return;
    void (async () => {
      if (profile.role === "driver") {
        const apps = await fetchMyApplications(profile.id);
        const out: { id: string; label: string }[] = [];
        const seen = new Set<string>();
        for (const a of apps) {
          const emp = a.job?.employer_id;
          if (emp && !seen.has(emp)) {
            seen.add(emp);
            out.push({ id: emp, label: "Employer" });
          }
        }
        setSupabasePeers(out);
      } else {
        const apps = await fetchEmployerApplications(profile.id);
        const out: { id: string; label: string }[] = [];
        const seen = new Set<string>();
        for (const a of apps) {
          const dr = a.driver_id;
          if (dr && !seen.has(dr)) {
            seen.add(dr);
            out.push({
              id: dr,
              label: a.driver?.profile?.full_name ?? "Driver",
            });
          }
        }
        setSupabasePeers(out);
      }
    })();
  }, [profile, mockApplications]);

  async function send() {
    if (!profile || !otherId || !text.trim()) return;
    const content = text.trim();
    setText("");
    if (shouldUseMockData()) {
      addMessage({
        id: `m-${Date.now()}`,
        sender_id: profile.id,
        receiver_id: otherId,
        content,
        created_at: new Date().toISOString(),
      });
      void reload();
      return;
    }
    const sb = getBrowserClient();
    if (!sb) return;
    await sb.from("messages").insert({
      sender_id: profile.id,
      receiver_id: otherId,
      content,
    });
    void reload();
  }

  if (!profile) return null;

  return (
    <div className="grid min-h-[480px] gap-4 lg:grid-cols-[220px_1fr] animate-fade-in">
      <Card className="p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Conversations
        </p>
        <ul className="space-y-1">
          {suggestions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/messages?with=${s.id}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  otherId === s.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/60"
                }`}
                onClick={() => setOtherId(s.id)}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
        {suggestions.length === 0 && (
          <p className="text-xs text-zinc-500">
            Apply to a job or view a driver profile to start messaging.
          </p>
        )}
      </Card>
      <Card className="flex flex-col">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h1 className="text-lg font-semibold text-white">Messages</h1>
          <p className="text-xs text-zinc-500">
            Supabase Realtime delivers new messages while this tab is open.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {loading && (
              <p className="text-sm text-zinc-500">Loading thread…</p>
            )}
            {!loading &&
              thread.map((m) => {
                const mine = m.sender_id === profile.id;
                return (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      mine
                        ? "ml-auto bg-emerald-500/20 text-emerald-50"
                        : "mr-auto bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    <p>{m.content}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {formatRelativeTime(m.created_at)}
                    </p>
                  </div>
                );
              })}
          </div>
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button type="button" onClick={() => void send()}>
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
