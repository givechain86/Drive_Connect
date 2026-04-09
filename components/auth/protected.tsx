"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [initialized, user, profile, router]);

  if (!initialized || !user || !profile) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
