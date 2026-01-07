"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";

interface ThinkingStep {
  expert: string;
  status: "pending" | "thinking" | "complete";
}

interface ExpertReviewSkeletonProps {
  steps: ThinkingStep[];
  currentStep: number;
  className?: string;
}

export function ExpertReviewSkeleton({ steps, currentStep, className }: ExpertReviewSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <IconSparkles className="h-5 w-5 animate-pulse text-primary" />
          <span className="font-medium text-primary">Expert Council in Session</span>
        </div>
        <p className="mt-3 text-muted-foreground">
          Our experts are analyzing your goals...
        </p>
      </div>

      {/* Progress steps */}
      <div className="mx-auto max-w-md space-y-3">
        {steps.map((step, idx) => (
          <div
            key={step.expert}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 transition-all",
              step.status === "thinking" && "border-primary bg-primary/5",
              step.status === "complete" && "border-green-500/30 bg-green-500/5"
            )}
          >
            {/* Status indicator */}
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                step.status === "pending" && "bg-muted",
                step.status === "thinking" && "bg-primary/20",
                step.status === "complete" && "bg-green-500/20"
              )}
            >
              {step.status === "pending" && (
                <span className="text-sm font-medium text-muted-foreground">{idx + 1}</span>
              )}
              {step.status === "thinking" && (
                <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {step.status === "complete" && (
                <IconSparkles className="h-5 w-5 text-green-600" />
              )}
            </div>

            {/* Expert info */}
            <div className="flex-1">
              <p
                className={cn(
                  "font-medium",
                  step.status === "thinking" && "text-primary",
                  step.status === "complete" && "text-green-600"
                )}
              >
                {step.expert}
              </p>
              <p className="text-sm text-muted-foreground">
                {step.status === "pending" && "Waiting..."}
                {step.status === "thinking" && "Analyzing your goals..."}
                {step.status === "complete" && "Review complete!"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton content preview */}
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>

      {/* Fun thinking messages */}
      <ThinkingMessages currentStep={currentStep} />
    </div>
  );
}

function ThinkingMessages({ currentStep }: { currentStep: number }) {
  const messages = [
    "Examining goal clarity and specificity...",
    "Calculating optimal progress metrics...",
    "Identifying potential obstacles...",
    "Crafting personalized strategies...",
    "Synthesizing expert insights...",
  ];

  const currentMessage = messages[currentStep % messages.length];

  return (
    <div className="text-center">
      <p className="animate-pulse text-sm text-muted-foreground italic">
        {currentMessage}
      </p>
    </div>
  );
}

// Simple skeleton for loading states
export function ReviewLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <div className="space-y-4">
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
