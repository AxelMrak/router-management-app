import { cn } from "@/utils/cn";

type StatusBadgeVariant = "online" | "offline" | "blocked" | "active" | "inactive";

const VARIANTS: Record<StatusBadgeVariant, string> = {
  online: "bg-[oklch(0.63_0.18_150)]/15 text-[oklch(0.63_0.18_150)] border-[oklch(0.63_0.18_150)]/25",
  offline: "bg-muted/60 text-muted-foreground border-border",
  blocked: "bg-destructive/15 text-destructive border-destructive/25",
  active: "bg-primary/15 text-primary border-primary/25",
  inactive: "bg-muted/60 text-muted-foreground border-border",
};

const DOTS: Record<StatusBadgeVariant, string> = {
  online: "bg-[oklch(0.63_0.18_150)]",
  offline: "bg-muted-foreground",
  blocked: "bg-destructive",
  active: "bg-primary",
  inactive: "bg-muted-foreground",
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const text = label ?? variant.charAt(0).toUpperCase() + variant.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        VARIANTS[variant],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", DOTS[variant])} />
      {text}
    </span>
  );
}
