import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "live"
    | "online"
    | "offline"
    | "on-air"
    | "category"
    | "pending"
    | "approved"
    | "played"
    | "rejected"
    | "neutral"
    | "gold";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full tracking-wide uppercase transition-colors";

  const sizeStyles = {
    sm: "text-[10px] px-2.5 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1 gap-1.5",
  };

  const variantStyles = {
    live: "bg-live/15 text-red-400 border border-live/30",
    "on-air": "bg-live text-white font-bold tracking-wider border border-red-400 glow-live animate-pulse",
    online: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    offline: "bg-slate-700/50 text-slate-400 border border-slate-600/50",
    category: "bg-radio-500/15 text-radio-400 border border-radio-500/30 font-semibold",
    gold: "bg-gold-500/15 text-gold-400 border border-gold-500/30 font-semibold",
    pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    approved: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    played: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    neutral: "bg-navy-800 text-slate-300 border border-navy-700",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-live animate-ping" />
      )}
      {variant === "online" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      )}
      {variant === "offline" && (
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      )}
      {children}
    </span>
  );
}
