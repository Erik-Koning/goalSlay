"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { GoalRevisionPanel } from "./GoalRevisionPanel";
import {
  IconTarget,
  IconSparkles,
  IconCalendar,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconCheck,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface GoalCreationWizardProps {
  className?: string;
  onComplete?: (goalId: string) => void;
}

type WizardStep = "details" | "revision" | "review";

export function GoalCreationWizard({ className, onComplete }: GoalCreationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [createdGoalId, setCreatedGoalId] = useState<string | null>(null);
  const [isRequestingReview, setIsRequestingReview] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const canProceed = title.trim().length >= 3 && description.trim().length >= 10;

  const handleCreateGoal = useCallback(async (submitForReview: boolean = false) => {
    if (!canProceed || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Create the goal
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          targetDate: targetDate || null,
          status: submitForReview ? "active" : "draft",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create goal");
      }

      const goal = await response.json();
      setCreatedGoalId(goal.id);
      toast.success("Goal created successfully!");

      if (submitForReview) {
        setStep("review");
        setIsRequestingReview(true);
        // Request expert council review
        try {
          const reviewResponse = await fetch(`/api/goals/${goal.id}/review`, {
            method: "POST",
          });

          if (!reviewResponse.ok) {
            throw new Error("Failed to get expert review");
          }

          toast.success("Expert Council review complete!");
        } catch {
          toast.error("Could not get expert review. You can try again later.");
        } finally {
          setIsRequestingReview(false);
        }
      }

      onComplete?.(goal.id);

      // Navigate to goal page if not requesting review
      if (!submitForReview) {
        router.push(`/goals/${goal.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  }, [canProceed, title, description, targetDate, isSubmitting, onComplete, router]);

  const handleAcceptRevision = useCallback((revisedTitle: string, revisedDescription: string) => {
    setTitle(revisedTitle);
    setDescription(revisedDescription);
    setShowRevision(false);
    toast.success("Revised version applied!");
  }, []);

  const handleRejectRevision = useCallback(() => {
    setShowRevision(false);
  }, []);

  const handleViewGoal = useCallback(() => {
    if (createdGoalId) {
      router.push(`/goals/${createdGoalId}`);
    }
  }, [createdGoalId, router]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          step === "details" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          1
        </div>
        <div className="w-12 h-0.5 bg-muted" />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          step === "revision" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
        <div className="w-12 h-0.5 bg-muted" />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          step === "review" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          3
        </div>
      </div>

      {/* Step 1: Goal Details */}
      {step === "details" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconTarget className="h-5 w-5 text-primary" />
              <CardTitle>Define Your Goal</CardTitle>
            </div>
            <CardDescription>
              Start by describing what you want to achieve. Be as specific as possible.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Learn Spanish to conversational level"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                A clear, concise title for your goal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your goal in detail. What does success look like? Why is this important to you?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                {description.length} characters (minimum 10)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (Optional)</Label>
              <div className="relative">
                <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowRevision(true)}
              disabled={!canProceed || isSubmitting}
            >
              <IconSparkles className="mr-2 h-4 w-4" />
              Get AI Suggestions
            </Button>
            <Button
              onClick={() => setStep("revision")}
              disabled={!canProceed || isSubmitting}
            >
              Continue
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* AI Revision Panel (can show on step 1) */}
      {showRevision && step === "details" && (
        <GoalRevisionPanel
          title={title}
          description={description}
          onAccept={handleAcceptRevision}
          onReject={handleRejectRevision}
        />
      )}

      {/* Step 2: Review & Submit */}
      {step === "revision" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconCheck className="h-5 w-5 text-primary" />
              <CardTitle>Review Your Goal</CardTitle>
            </div>
            <CardDescription>
              Review your goal and choose how to proceed
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="font-medium">{title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{description}</p>
              </div>
              {targetDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target Date</p>
                  <p className="text-sm">
                    {new Date(targetDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <IconUsers className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Expert Council Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit your goal to our council of 11 AI experts for comprehensive feedback
                    on strategy, motivation, obstacles, timeline, and more.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("details")} disabled={isSubmitting}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Edit Goal
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleCreateGoal(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save as Draft
              </Button>
              <Button onClick={() => handleCreateGoal(true)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconUsers className="mr-2 h-4 w-4" />
                )}
                Submit for Review
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Expert Review Status */}
      {step === "review" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-primary" />
              <CardTitle>Expert Council Review</CardTitle>
            </div>
            <CardDescription>
              {isRequestingReview
                ? "Our 11 expert AI advisors are analyzing your goal..."
                : "Review complete! View your goal to see the expert feedback."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isRequestingReview ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="relative">
                  <IconUsers className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">Expert Council is convening...</p>
                  <p className="text-sm text-muted-foreground">
                    11 experts are reviewing your goal from different perspectives
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <span>Strategist</span>
                  <span>Motivator</span>
                  <span>Obstacle Analyst</span>
                  <span>Progress Tracker</span>
                  <span>Skill Advisor</span>
                  <span>Time Optimizer</span>
                  <span>Wellness Guide</span>
                  <span>Accountability</span>
                  <span>Resource Planner</span>
                  <span>Milestone Designer</span>
                  <span>Success Definer</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
                  <IconCheck className="h-8 w-8" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">Review Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Your goal has been reviewed by our Expert Council
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <Button onClick={handleViewGoal} disabled={isRequestingReview}>
              View Goal & Expert Feedback
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
