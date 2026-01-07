"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GoalWizard } from "@/src/components/goals/GoalWizard";
import { ExpertGrid } from "@/src/components/experts/ExpertGrid";
import { ExpertReviewSkeleton } from "@/src/components/experts/ExpertReviewSkeleton";
import { ExpertReviewResults } from "@/src/components/experts/ExpertReviewResults";

type Step = "goals" | "experts" | "review" | "results";

interface GoalDraft {
  id: string;
  text: string;
  order: number;
  validationStatus: "pending" | "valid" | "warning" | "rejected";
  feedback?: string;
}

interface GoalWithExperts extends GoalDraft {
  selectedExperts: string[];
}

interface ReviewResult {
  goalSetId: string;
  goals: Array<{
    goalId: string;
    validationStatus: "pending" | "valid" | "warning" | "rejected";
    validationFeedback: string;
    expertSummary: string;
    expertReviews: Array<{
      expertId: string;
      expertName: string;
      reviewContent: string;
      actionItems?: string[];
    }>;
    progressEstimate?: {
      unit: string;
      estimatedPerDay: number;
      estimatedPerWeek: number;
    };
  }>;
  overallFeedback: string;
}

export default function NewGoalsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("goals");
  const [goals, setGoals] = useState<GoalWithExperts[]>([]);
  const [goalSetId, setGoalSetId] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [reviewSteps, setReviewSteps] = useState<
    Array<{ expert: string; status: "pending" | "thinking" | "complete" }>
  >([]);
  const [currentReviewStep, setCurrentReviewStep] = useState(0);

  const handleGoalsComplete = useCallback((drafts: GoalDraft[]) => {
    const goalsWithExperts = drafts.map((g) => ({
      ...g,
      selectedExperts: ["progress_tracker"], // Auto-select required expert
    }));
    setGoals(goalsWithExperts);
    setStep("experts");
  }, []);

  const handleExpertsComplete = useCallback(
    async (goalsWithExperts: GoalWithExperts[]) => {
      setGoals(goalsWithExperts);
      setStep("review");

      // Get unique experts for progress display
      const allExperts = new Set<string>();
      goalsWithExperts.forEach((g) => g.selectedExperts.forEach((e) => allExperts.add(e)));

      const expertNames: Record<string, string> = {
        progress_tracker: "Progress Tracker",
        motivator: "Motivation Coach",
        strategist: "Strategic Planner",
        accountability: "Accountability Partner",
        obstacle_analyst: "Obstacle Analyst",
        time_optimizer: "Time Optimizer",
        skill_advisor: "Skills Advisor",
        wellness_guide: "Wellness Guide",
      };

      setReviewSteps(
        Array.from(allExperts).map((id) => ({
          expert: expertNames[id] || id,
          status: "pending" as const,
        }))
      );

      try {
        // Create goal set
        const createResponse = await fetch("/api/goal-sets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goals: goalsWithExperts.map((g) => ({
              goalText: g.text,
              goalOrder: g.order,
            })),
            startDate: new Date().toISOString(),
          }),
        });

        const goalSet = await createResponse.json();
        setGoalSetId(goalSet.id);

        // Simulate expert progress (in reality, this would be streamed)
        for (let i = 0; i < reviewSteps.length; i++) {
          setCurrentReviewStep(i);
          setReviewSteps((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "thinking" } : s
            )
          );
          await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
          setReviewSteps((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "complete" } : s
            )
          );
        }

        // Trigger expert review
        const reviewResponse = await fetch("/api/goals/experts/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalSetId: goalSet.id,
            goals: goalsWithExperts.map((g, idx) => ({
              goalId: goalSet.goals[idx].id,
              goalText: g.text,
              goalOrder: g.order,
              selectedExperts: g.selectedExperts,
            })),
          }),
        });

        const result = await reviewResponse.json();
        setReviewResult(result);
        setStep("results");
      } catch (error) {
        console.error("Review failed:", error);
        // Handle error - go back to experts step
        setStep("experts");
      }
    },
    [reviewSteps.length]
  );

  const handleActivate = async () => {
    if (!goalSetId) return;

    try {
      await fetch(`/api/goal-sets/${goalSetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      router.push("/goals");
    } catch (error) {
      console.error("Activation failed:", error);
    }
  };

  const handleEdit = () => {
    setStep("goals");
  };

  return (
    <div className="container max-w-4xl py-8">
      {step === "goals" && (
        <GoalWizard
          onComplete={handleGoalsComplete}
          onCancel={() => router.push("/goals")}
        />
      )}

      {step === "experts" && (
        <ExpertGrid
          goals={goals.map((g) => ({
            id: g.id,
            text: g.text,
            order: g.order,
            selectedExperts: g.selectedExperts,
          }))}
          onComplete={handleExpertsComplete as any}
          onBack={() => setStep("goals")}
        />
      )}

      {step === "review" && (
        <ExpertReviewSkeleton
          steps={reviewSteps}
          currentStep={currentReviewStep}
        />
      )}

      {step === "results" && reviewResult && (
        <ExpertReviewResults
          goalSetId={goalSetId!}
          goals={reviewResult.goals}
          overallFeedback={reviewResult.overallFeedback}
          onActivate={handleActivate}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
