"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants: Record<string, string> = {
  primary:
    "bg-indigo text-white hover:bg-indigo-dark shadow-soft hover:shadow-card-hover",
  secondary:
    "bg-navy text-white hover:bg-navy-light shadow-soft hover:shadow-card-hover",
  outline:
    "border border-slate-border text-charcoal dark:text-white dark:border-white/20 hover:bg-slate-border/30 dark:hover:bg-white/10 bg-transparent",
  ghost:
    "text-charcoal dark:text-white hover:bg-slate-border/40 dark:hover:bg-white/10 bg-transparent",
  danger: "bg-danger text-white hover:bg-red-600 shadow-soft",
};

const sizes: Record<string, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-6 py-3 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-heading font-semibold transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";