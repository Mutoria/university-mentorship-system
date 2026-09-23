import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-navy/10 text-navy dark:bg-white/10 dark:text-white",
  success: "bg-teal/10 text-teal-dark",
  warning: "bg-gold/15 text-gold",
  danger: "bg-danger/10 text-danger",
  info: "bg-indigo/10 text-indigo",
  outline: "border border-slate-border text-slate bg-transparent",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold font-heading",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}