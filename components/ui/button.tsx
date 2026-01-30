"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-pixel uppercase tracking-wider
      border-pixel border-black shadow-pixel
      transition-all duration-100
      hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-pixel-sm
      active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-pixel
    `;

    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600",
      secondary: "bg-secondary-600 text-white hover:bg-secondary-700",
      accent: "bg-accent-600 text-white hover:bg-accent-700",
      danger: "bg-health text-white hover:bg-red-700",
      ghost: "bg-transparent border-transparent shadow-none text-foreground hover:bg-white/10 hover:shadow-none",
    };

    const sizes = {
      sm: "px-2 py-1 text-[8px]",
      md: "px-4 py-2 text-[10px]",
      lg: "px-6 py-3 text-xs",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="animate-bounce-pixel">.</span>
            <span className="animate-bounce-pixel [animation-delay:0.1s]">.</span>
            <span className="animate-bounce-pixel [animation-delay:0.2s]">.</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
