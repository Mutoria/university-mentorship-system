import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hoverable,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-slate-border dark:border-white/10 bg-surface dark:bg-navy-light p-6 shadow-card transition-all duration-300",
        hoverable && "hover:shadow-card-hover hover:-translate-y-1",
        className
      )}
      {...props}
    />
  );
}