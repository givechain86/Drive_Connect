import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isValidSupabaseUrl,
} from "@/lib/config";

let browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key || !isValidSupabaseUrl(url)) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}
