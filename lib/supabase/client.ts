import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isValidSupabaseUrl,
} from "@/lib/config";

let browserClient: SupabaseClient | null = null;
let hydratePromise: Promise<SupabaseClient | null> | null = null;

function createIfValid(url: string, key: string): SupabaseClient | null {
  if (!url || !key || !isValidSupabaseUrl(url)) return null;
  return createBrowserClient(url, key);
}

export function getBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  const client = createIfValid(url, key);
  if (client) browserClient = client;
  return browserClient;
}

/**
 * Ensures a browser Supabase client exists. If env vars are missing from the
 * client bundle, loads them from GET /api/supabase-config (server reads .env).
 */
export async function resolveBrowserClient(): Promise<SupabaseClient | null> {
  const existing = getBrowserClient();
  if (existing) return existing;

  if (typeof window === "undefined") {
    return null;
  }

  if (!hydratePromise) {
    hydratePromise = fetch("/api/supabase-config", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        let data: { ok?: boolean; url?: string; anonKey?: string };
        try {
          data = await res.json();
        } catch {
          return null;
        }
        if (!data.ok || !data.url || !data.anonKey) return null;
        const client = createIfValid(data.url, data.anonKey);
        if (client) browserClient = client;
        return client;
      })
      .catch(() => null)
      .finally(() => {
        queueMicrotask(() => {
          hydratePromise = null;
        });
      });
  }

  return hydratePromise;
}
