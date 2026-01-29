"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import {
  IconTarget,
  IconCalendar,
  IconTrendingUp,
  IconChevronRight,
  IconUsers,
  IconStar,
} from "@tabler/icons-react";
import Link from "next/link";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    status: string;
    targetDate?: string | null;
    councilScore?: number | null;
    councilReviewedAt?: string | null;
    _count?: {
      expertReviews?: number;
      goalUpdates?: number;
    };
  };
  className?: string;
  showActions?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" },
  draft: { label: "Draft", variant: "outline" },
};

export function GoalCard({ goal, className, showActions = true }: GoalCardProps) {
  const statusConfig = STATUS_CONFIG[goal.status] || STATUS_CONFIG.draft;
  const hasCouncilReview = goal.councilScore != null;
  const scorePercentage = hasCouncilReview ? (goal.councilScore! / 10) * 100 : 0;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconTarget className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{goal.title}</CardTitle>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Target Date */}
        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="h-4 w-4" />
            <span>Target: {formatDate(goal.targetDate)}</span>
          </div>
        )}

        {/* Council Review Score */}
        {hasCouncilReview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <IconUsers className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Expert Council Score</span>
              </div>
              <div className="flex items-center gap-1">
                <IconStar className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{goal.councilScore?.toFixed(1)}/10</span>
              </div>
            </div>
            <Progress value={scorePercentage} className="h-2" />
            {goal.councilReviewedAt && (
              <p className="text-xs text-muted-foreground">
                Reviewed {formatDate(goal.councilReviewedAt)}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {goal._count && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {goal._count.goalUpdates != null && goal._count.goalUpdates > 0 && (
              <div className="flex items-center gap-1">
                <IconTrendingUp className="h-4 w-4" />
                <span>{goal._count.goalUpdates} updates</span>
              </div>
            )}
            {goal._count.expertReviews != null && goal._count.expertReviews > 0 && (
              <div className="flex items-center gap-1">
                <IconUsers className="h-4 w-4" />
                <span>{goal._count.expertReviews} expert reviews</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/goals/${goal.id}`}>
              View Details
              <IconChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
