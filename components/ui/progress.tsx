"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "hp" | "mana" | "xp" | "stamina" | "boss";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = "xp", showLabel = false, size = "md", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      hp: "bg-health",
      mana: "bg-mana",
      xp: "bg-xp",
      stamina: "bg-stamina",
      boss: "bg-health",
    };

    const sizes = {
      sm: "h-2",
      md: "h-4",
      lg: "h-6",
    };

    return (
      <div className={cn("relative", className)} {...props} ref={ref}>
        <div
          className={cn(
            "w-full border-2 border-black bg-gray-800 overflow-hidden",
            sizes[size]
          )}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-pixel text-[8px] text-white drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
              {Math.round(value)}/{max}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
