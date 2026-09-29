import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-navy-700 bg-navy-850/40",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 mb-4 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-radio-400">
          {icon}
        </div>
      )}
      <h4 className="text-base md:text-lg font-semibold text-white mb-1.5">
        {title}
      </h4>
      <p className="text-xs md:text-sm text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
