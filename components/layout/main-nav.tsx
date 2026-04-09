"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Map,
  MessageCircle,
  Truck,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { Button } from "@/components/ui/button";

const driverLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/map", label: "Map", icon: Map },
  { href: "/messages", label: "Chat", icon: MessageCircle },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

const employerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Job posts", icon: Briefcase },
  { href: "/hiring", label: "Hiring", icon: Users },
  { href: "/drivers", label: "Drivers", icon: Truck },
  { href: "/map", label: "Map", icon: Map },
  { href: "/messages", label: "Chat", icon: MessageCircle },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Company", icon: User },
];

export function MainNav() {
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);
  const mockMode = useAuthStore((s) => s.mockMode);
  const clearSession = useAuthStore((s) => s.clearSession);

  const links = profile?.role === "employer" ? employerLinks : driverLinks;

  async function handleSignOut() {
    clearSession();
    if (!shouldUseMockData()) {
      const sb = getBrowserClient();
      await sb?.auth.signOut();
    }
    window.location.href = "/login";
  }

  if (!profile) return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-zinc-950">
              DC
            </span>
            DriverConnect
          </Link>
          {mockMode && (
            <span className="hidden rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200 sm:inline">
              Demo data
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <nav className="border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 py-2 sm:px-6">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
