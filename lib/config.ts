function normalizeEnv(value: string | undefined): string {
  let s = (value ?? "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function getSupabaseUrl(): string {
  return normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isValidSupabaseUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && key && isValidSupabaseUrl(url));
}

/** True when Supabase env is missing or NEXT_PUBLIC_FORCE_MOCK=true */
export function shouldUseMockData(): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_MOCK === "true") return true;
  return !isSupabaseConfigured();
}
