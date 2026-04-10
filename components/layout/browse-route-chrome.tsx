"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/store/auth-store";

/**
 * Public routes (/jobs, /drivers, /employers) use this layout. Signed-in users with a
 * profile get the app shell; visitors see the page without the dashboard nav.
 */
export function BrowseRouteChrome({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  if (!initialized) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
  }

  if (user && profile) {
    return <AppShell>{children}</AppShell>;
  }

  return <>{children}</>;
}
