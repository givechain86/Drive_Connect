import { NextResponse } from "next/server";
import { loadEnvFromAppRoot } from "@/lib/env-bootstrap";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isValidSupabaseUrl,
} from "@/lib/config";

/**
 * Exposes public Supabase settings to the browser when NEXT_PUBLIC_* is not
 * inlined (common with wrong monorepo / lockfile root). The anon key is
 * already public by design.
 */
export async function GET() {
  loadEnvFromAppRoot();
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const ok = Boolean(url && anonKey && isValidSupabaseUrl(url));
  return NextResponse.json(
    ok ? { ok: true as const, url, anonKey } : { ok: false as const, url: "", anonKey: "" }
  );
}
