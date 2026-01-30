"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 font-pixel text-[10px] uppercase text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 font-pixel text-xs",
            "border-pixel border-black bg-white text-gray-900",
            "shadow-pixel-inset",
            "focus:outline-none focus:ring-2 focus:ring-primary-500",
            "placeholder:text-gray-400",
            error && "border-health ring-2 ring-health/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 font-pixel text-[8px] text-health">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
