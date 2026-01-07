"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconChartLine,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";

interface ExpertReview {
  expertId: string;
  expertName: string;
  reviewContent: string;
  actionItems?: string[];
}

interface ProgressEstimate {
  unit: string;
  estimatedPerDay: number;
  estimatedPerWeek: number;
}

interface GoalReviewResult {
  goalId: string;
  validationStatus: "pending" | "valid" | "warning" | "rejected";
  validationFeedback: string;
  expertSummary: string;
  expertReviews: ExpertReview[];
  progressEstimate?: ProgressEstimate;
}

interface ExpertReviewResultsProps {
  goalSetId: string;
  goals: GoalReviewResult[];
  overallFeedback: string;
  onActivate: () => void;
  onEdit: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  valid: {
    icon: IconCheck,
    color: "text-green-600",
    bg: "bg-green-500/10",
    label: "Approved",
  },
  warning: {
    icon: IconAlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    label: "Needs Attention",
  },
  rejected: {
    icon: IconX,
    color: "text-red-600",
    bg: "bg-red-500/10",
    label: "Needs Revision",
  },
  pending: {
    icon: IconSparkles,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Pending",
  },
};

export function ExpertReviewResults({
  goalSetId,
  goals,
  overallFeedback,
  onActivate,
  onEdit,
  className,
}: ExpertReviewResultsProps) {
  const hasRejected = goals.some((g) => g.validationStatus === "rejected");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2">
          <IconSparkles className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-600">Expert Review Complete</span>
        </div>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          {overallFeedback}
        </p>
      </div>

      {/* Goals accordion */}
      <Accordion type="single" collapsible className="space-y-4">
        {goals.map((goal, idx) => {
          const config = STATUS_CONFIG[goal.validationStatus];
          const StatusIcon = config.icon;

          return (
            <AccordionItem
              key={goal.goalId}
              value={goal.goalId}
              className="rounded-lg border"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      config.bg
                    )}
                  >
                    <StatusIcon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Goal {idx + 1}</p>
                    <p className={cn("text-sm", config.color)}>{config.label}</p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                {/* Summary */}
                <div className="rounded-lg bg-muted/50 p-4 mb-4">
                  <h4 className="font-medium mb-2">Expert Summary</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {goal.expertSummary}
                  </p>
                </div>

                {/* Progress estimate */}
                {goal.progressEstimate && (
                  <div className="flex items-center gap-4 rounded-lg border p-4 mb-4">
                    <IconChartLine className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Progress Targets</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.progressEstimate.estimatedPerDay} {goal.progressEstimate.unit}/day
                        {" • "}
                        {goal.progressEstimate.estimatedPerWeek} {goal.progressEstimate.unit}/week
                      </p>
                    </div>
                  </div>
                )}

                {/* Expert reviews */}
                <div className="space-y-3">
                  <h4 className="font-medium">Expert Feedback</h4>
                  {goal.expertReviews.map((review) => (
                    <div key={review.expertId} className="rounded-lg border p-4">
                      <p className="font-medium text-sm text-primary">
                        {review.expertName}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.reviewContent}
                      </p>
                      {review.actionItems && review.actionItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Action Items:
                          </p>
                          <ul className="space-y-1">
                            {review.actionItems.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <IconArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Validation feedback */}
                {goal.validationFeedback && (
                  <div className={cn("mt-4 rounded-lg p-4", config.bg)}>
                    <p className={cn("text-sm", config.color)}>
                      {goal.validationFeedback}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t">
        <Button variant="outline" onClick={onEdit}>
          Edit Goals
        </Button>
        <Button onClick={onActivate} disabled={hasRejected}>
          {hasRejected ? "Fix Rejected Goals First" : "Activate Goal Set"}
          <IconArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
