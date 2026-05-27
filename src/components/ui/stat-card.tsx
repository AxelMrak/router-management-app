import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const ACCENT_CLASSES = {
  primary: "text-primary bg-primary/10 border-primary/20",
  success: "text-[oklch(0.63_0.18_150)] bg-[oklch(0.63_0.18_150)]/10 border-[oklch(0.63_0.18_150)]/20",
  warning: "text-[oklch(0.75_0.18_65)] bg-[oklch(0.75_0.18_65)]/10 border-[oklch(0.75_0.18_65)]/20",
  destructive: "text-destructive bg-destructive/10 border-destructive/20",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "primary",
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center shrink-0", ACCENT_CLASSES[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
