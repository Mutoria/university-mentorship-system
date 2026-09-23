import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  colorClass?: string;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({
  initials,
  colorClass = "bg-indigo",
  size = "md",
  ring,
}: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-heading font-bold text-white shrink-0",
        sizes[size],
        colorClass,
        ring && "ring-2 ring-surface dark:ring-navy ring-offset-2 ring-offset-transparent"
      )}
    >
      {initials}
    </div>
  );
}