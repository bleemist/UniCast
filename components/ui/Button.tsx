import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "live"
    | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-radio-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-radio-500 hover:bg-radio-600 text-navy-950 font-semibold shadow-md shadow-radio-500/20 hover:shadow-radio-500/30",
      secondary:
        "bg-navy-800 hover:bg-navy-750 text-slate-100 border border-navy-700 hover:border-navy-600 shadow-sm",
      outline:
        "border border-radio-500/40 text-radio-400 hover:bg-radio-500/10 hover:border-radio-400",
      ghost:
        "text-slate-300 hover:text-white hover:bg-navy-800/60",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20",
      live:
        "bg-live hover:bg-red-600 text-white font-semibold glow-live animate-none",
      gold:
        "bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold shadow-md shadow-gold-500/20",
    };

    const sizeStyles = {
      sm: "text-sm px-4 py-2 h-9 gap-2",
      md: "text-base px-5 py-2.5 h-11 gap-2.5",
      lg: "text-lg px-7 py-3.5 h-14 gap-3",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
