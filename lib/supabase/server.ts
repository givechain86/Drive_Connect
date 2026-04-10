import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { loadEnvFromAppRoot } from "@/lib/env-bootstrap";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isValidSupabaseUrl,
} from "@/lib/config";

export async function createClient() {
  loadEnvFromAppRoot();
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key || !isValidSupabaseUrl(url)) {
    throw new Error(
      "Missing or invalid NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (URL must start with https://)"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* Server Component */
        }
      },
    },
  });
}
