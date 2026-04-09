import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        "disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" &&
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98]",
        variant === "secondary" &&
          "border border-zinc-700 bg-zinc-900/80 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800",
        variant === "ghost" &&
          "text-zinc-300 hover:bg-zinc-800/80 hover:text-white",
        variant === "danger" &&
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
        size === "sm" && "h-9 px-3.5 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
