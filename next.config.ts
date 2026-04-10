import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local from this app folder (not a parent monorepo root).
const { combinedEnv } = loadEnvConfig(projectRoot);

function stripEnv(value: string | undefined): string {
  if (!value) return "";
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

const nextPublicSupabaseUrl = stripEnv(
  combinedEnv.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
);
const nextPublicSupabaseAnonKey = stripEnv(
  combinedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Inline into the client bundle even when Next picks a different workspace root
// (e.g. extra lockfile in $HOME). Without this, getBrowserClient() stays null.
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: nextPublicSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: nextPublicSupabaseAnonKey,
  },
};

export default nextConfig;
