"use client";

import {
  IconTarget,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconDots,
  IconEdit,
  IconTrash,
  IconPlayerPlay,
  IconPlayerPause,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { GoalProgressBar } from "./GoalProgressBar";
import { Goal, GOAL_STATUS, calculateProgress, getDaysRemaining } from "@/lib/stores/goalStore";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
}

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  NOT_STARTED: { label: "Not Started", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  ON_HOLD: { label: "On Hold", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "default" },
  ABANDONED: { label: "Abandoned", variant: "destructive" },
};

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Low", color: "text-blue-500" },
  2: { label: "Medium", color: "text-yellow-500" },
  3: { label: "High", color: "text-red-500" },
};

export function GoalCard({
  goal,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
}: GoalCardProps) {
  const progress = calculateProgress(goal);
  const daysRemaining = getDaysRemaining(goal);
  const statusInfo = STATUS_BADGES[goal.status] || STATUS_BADGES.NOT_STARTED;
  const priorityInfo = PRIORITY_LABELS[goal.priority] || PRIORITY_LABELS[2];

  const isOverdue = daysRemaining < 0 && goal.status !== "COMPLETED" && goal.status !== "ABANDONED";
  const isCompleted = goal.status === "COMPLETED";

  return (
    <Card
      className={cn(
        "@container/card cursor-pointer transition-shadow hover:shadow-md",
        isCompleted && "border-green-500/50 bg-green-500/5"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {goal.category && (
              <CardDescription className="text-xs uppercase tracking-wide">
                {goal.category}
              </CardDescription>
            )}
            <CardTitle className="line-clamp-2 text-lg font-semibold">
              {goal.title}
            </CardTitle>
          </div>
          <CardAction className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {(onEdit || onDelete || onStatusChange) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <IconDots className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <IconEdit className="mr-2 h-4 w-4" />
                      Edit Goal
                    </DropdownMenuItem>
                  )}
                  {onStatusChange && goal.status !== "IN_PROGRESS" && (
                    <DropdownMenuItem onClick={() => onStatusChange("IN_PROGRESS")}>
                      <IconPlayerPlay className="mr-2 h-4 w-4" />
                      Start Working
                    </DropdownMenuItem>
                  )}
                  {onStatusChange && goal.status === "IN_PROGRESS" && (
                    <DropdownMenuItem onClick={() => onStatusChange("ON_HOLD")}>
                      <IconPlayerPause className="mr-2 h-4 w-4" />
                      Put On Hold
                    </DropdownMenuItem>
                  )}
                  {onStatusChange && goal.status !== "COMPLETED" && (
                    <DropdownMenuItem onClick={() => onStatusChange("COMPLETED")}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Delete Goal
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardAction>
        </div>
      </CardHeader>

      <div className="px-4 pb-3">
        <GoalProgressBar
          currentValue={goal.currentValue}
          targetValue={goal.targetValue}
          unit={goal.unit}
          size="md"
        />
      </div>

      <CardFooter className="flex-col items-start gap-2 border-t pt-3 text-sm">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            {isOverdue ? (
              <span className="font-medium text-red-500">
                {Math.abs(daysRemaining)} days overdue
              </span>
            ) : isCompleted ? (
              <span className="font-medium text-green-500">Completed</span>
            ) : (
              <span className="text-muted-foreground">
                {daysRemaining} days remaining
              </span>
            )}
          </div>
          <span className={cn("text-xs font-medium", priorityInfo.color)}>
            {priorityInfo.label} Priority
          </span>
        </div>

        {goal.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {goal.description}
          </p>
        )}

        {progress >= 100 && !isCompleted && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
            <IconTrendingUp className="h-3 w-3" />
            Target reached! Mark as complete
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
