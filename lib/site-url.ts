function trimOrigin(s: string | undefined): string {
  if (!s) return "";
  return s.trim().replace(/\/$/, "");
}

/**
 * Origin used in auth email links (confirm, reset). Must match an entry in
 * Supabase → Authentication → URL Configuration → Redirect URLs (full URL
 * including path for the callback).
 */
export function getPublicSiteUrl(): string {
  const env = trimOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (typeof window !== "undefined") {
    if (env) return env;
    return window.location.origin;
  }
  return env || "http://localhost:3001";
}

export function getAuthCallbackUrl(): string {
  return `${getPublicSiteUrl()}/auth/callback`;
}
