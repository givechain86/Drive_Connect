"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingDisplay({
  avg,
  count,
  className,
}: {
  avg: number | null;
  count: number;
  className?: string;
}) {
  if (count === 0 || avg == null) {
    return (
      <span className={cn("text-xs text-zinc-500", className)}>
        No ratings yet
      </span>
    );
  }
  const rounded = Math.round(avg);
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="flex text-amber-400" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5 sm:h-4 sm:w-4",
              i < rounded ? "fill-current" : "fill-none opacity-35"
            )}
          />
        ))}
      </span>
      <span className="text-xs text-zinc-400">
        {avg.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-0.5" role="group" aria-label="Rating 1 to 5">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={cn(
            "rounded p-0.5 transition-colors",
            disabled ? "opacity-50" : "hover:bg-zinc-800"
          )}
          aria-label={`${n} stars`}
          aria-pressed={value === n}
        >
          <Star
            className={cn(
              "h-7 w-7",
              n <= value ? "fill-amber-400 text-amber-400" : "text-zinc-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}
