import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-slate-border dark:border-white/10 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo/10">
        <Icon className="h-7 w-7 text-indigo" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-charcoal dark:text-white">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}