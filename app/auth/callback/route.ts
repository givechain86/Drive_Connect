import { NextResponse } from "next/server";
import { loadEnvFromAppRoot } from "@/lib/env-bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export async function GET(request: Request) {
  loadEnvFromAppRoot();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } catch {
    /* missing env in server */
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
