import * as React from "react";
import { cn } from "@/lib/utils";

export interface AudioVisualizerProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
  barColor?: string;
  size?: "sm" | "md" | "lg";
}

export function AudioVisualizer({
  isPlaying = false,
  barCount = 7,
  className,
  barColor = "bg-radio-400",
  size = "md",
}: AudioVisualizerProps) {
  const heights = [
    "h-2", "h-4", "h-6", "h-8", "h-5", "h-3", "h-6", "h-4", "h-7", "h-2",
  ];

  const sizeStyles = {
    sm: "h-5 gap-0.5",
    md: "h-8 gap-1",
    lg: "h-12 gap-1.5",
  };

  const barWidths = {
    sm: "w-0.5",
    md: "w-1",
    lg: "w-1.5",
  };

  return (
    <div
      className={cn(
        "flex items-end justify-center",
        sizeStyles[size],
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, idx) => {
        const animDelay = `${(idx * 0.15) % 0.8}s`;
        const animDuration = `${0.6 + ((idx * 0.23) % 0.7)}s`;

        return (
          <div
            key={idx}
            style={{
              animationDelay: animDelay,
              animationDuration: isPlaying ? animDuration : "0s",
            }}
            className={cn(
              "rounded-full transition-all duration-200",
              barWidths[size],
              barColor,
              isPlaying
                ? "animate-wave-bar origin-bottom"
                : heights[idx % heights.length] + " opacity-40"
            )}
          />
        );
      })}
    </div>
  );
}
