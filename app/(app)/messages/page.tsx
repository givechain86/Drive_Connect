import { Suspense } from "react";
import { MessagesClient } from "./messages-client";
import { Skeleton } from "@/components/ui/skeleton";

function MessagesFallback() {
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="h-48 rounded-2xl border border-zinc-800 bg-zinc-900/40" />
      <div className="min-h-[400px] rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <MessagesClient />
    </Suspense>
  );
}
