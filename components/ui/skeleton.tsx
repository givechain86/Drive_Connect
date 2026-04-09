import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-800/80",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <Skeleton className="mb-3 h-5 w-2/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
