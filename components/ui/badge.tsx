import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-zinc-800 text-zinc-200 border-zinc-600",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  danger: "bg-red-500/15 text-red-300 border-red-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
