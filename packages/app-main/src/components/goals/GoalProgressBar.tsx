"use client";

import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  currentValue: number;
  targetValue: number;
  unit?: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GoalProgressBar({
  currentValue,
  targetValue,
  unit = "percent",
  showLabels = true,
  size = "md",
  className,
}: GoalProgressBarProps) {
  const progress = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0;

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-emerald-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatValue = (value: number) => {
    if (unit === "percent") {
      return `${Math.round(value)}%`;
    }
    if (unit === "currency") {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className={cn("w-full", className)}>
      <Progress
        value={progress}
        className={cn(sizeClasses[size])}
        indicatorClassName={getProgressColor(progress)}
      />
      {showLabels && (
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>
            {formatValue(currentValue)} / {formatValue(targetValue)}
            {unit !== "percent" && unit !== "currency" && ` ${unit}`}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
