import * as React from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: "bg-radio-500/10 border-radio-500/30 text-radio-100 [&>svg]:text-radio-400",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-100 [&>svg]:text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-100 [&>svg]:text-amber-400",
    error: "bg-red-500/10 border-red-500/30 text-red-100 [&>svg]:text-red-400",
  };

  const icons = {
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold text-white">{title}</h5>}
        <div className="text-slate-300 text-xs md:text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
