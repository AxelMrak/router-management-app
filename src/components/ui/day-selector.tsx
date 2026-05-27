"use client";

import { cn } from "@/utils/cn";
import type { Weekday } from "@/types/router";

const DAYS: { value: Weekday; label: string }[] = [
  { value: "mon", label: "M" },
  { value: "tue", label: "T" },
  { value: "wed", label: "W" },
  { value: "thu", label: "T" },
  { value: "fri", label: "F" },
  { value: "sat", label: "S" },
  { value: "sun", label: "S" },
];

interface DaySelectorProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
  className?: string;
}

export function DaySelector({ value, onChange, className }: DaySelectorProps) {
  function toggle(day: Weekday) {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  }

  return (
    <div className={cn("flex gap-1", className)}>
      {DAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => toggle(day.value)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 border",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
            aria-label={day.value}
            aria-pressed={active}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
