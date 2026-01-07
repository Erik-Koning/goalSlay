"use client";

import { cn } from "@/lib/utils";
import { IconFlame, IconTrophy } from "@tabler/icons-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  size?: "sm" | "md" | "lg";
  showLongest?: boolean;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  size = "md",
  showLongest = true,
  className,
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: { container: "gap-1", icon: "h-4 w-4", text: "text-sm", number: "text-lg" },
    md: { container: "gap-2", icon: "h-6 w-6", text: "text-base", number: "text-2xl" },
    lg: { container: "gap-3", icon: "h-8 w-8", text: "text-lg", number: "text-4xl" },
  };

  const classes = sizeClasses[size];

  const flameColor =
    currentStreak >= 100
      ? "text-purple-500"
      : currentStreak >= 30
      ? "text-orange-500"
      : currentStreak >= 7
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className={cn("flex items-center", classes.container, className)}>
      <div className="relative">
        <IconFlame
          className={cn(
            classes.icon,
            flameColor,
            currentStreak > 0 && "animate-pulse"
          )}
        />
        {currentStreak >= 7 && (
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {currentStreak >= 100 ? "!" : ""}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={cn("font-bold", classes.number, flameColor)}>
            {currentStreak}
          </span>
          <span className={cn("text-muted-foreground", classes.text)}>
            day{currentStreak !== 1 ? "s" : ""}
          </span>
        </div>
        {showLongest && longestStreak > currentStreak && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconTrophy className="h-3 w-3" />
            Best: {longestStreak} days
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for headers/navs
export function StreakBadge({ streak, className }: { streak: number; className?: string }) {
  const color =
    streak >= 100
      ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
      : streak >= 30
      ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
      : streak >= 7
      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
      : "bg-red-500/10 text-red-500 border-red-500/30";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        color,
        className
      )}
    >
      <IconFlame className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{streak}</span>
    </div>
  );
}
