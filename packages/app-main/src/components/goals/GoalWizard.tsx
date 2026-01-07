"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { MysticalGoalButton } from "./MysticalGoalButton";
import { LipNotice, useLipNotice } from "./LipNotice";
import { GoalInput } from "./GoalInput";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";

interface GoalDraft {
  id: string;
  text: string;
  order: number;
  validationStatus: "pending" | "valid" | "warning" | "rejected";
  feedback?: string;
}

interface GoalWizardProps {
  onComplete: (goals: GoalDraft[]) => void;
  onCancel?: () => void;
  className?: string;
}

const MIN_GOALS = 3;
const MAX_GOALS = 5;

export function GoalWizard({ onComplete, onCancel, className }: GoalWizardProps) {
  const [goals, setGoals] = useState<GoalDraft[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { notice, showLoading, showSuccess, showError, showWarning, hideNotice } = useLipNotice();

  const addGoal = useCallback(
    async (goalText: string) => {
      if (goals.length >= MAX_GOALS) {
        showWarning(`Maximum of ${MAX_GOALS} goals allowed`);
        return;
      }

      const newGoal: GoalDraft = {
        id: crypto.randomUUID(),
        text: goalText,
        order: goals.length + 1,
        validationStatus: "pending",
      };

      setGoals((prev) => [...prev, newGoal]);
      setIsValidating(true);
      showLoading("Validating your goal...");

      try {
        const response = await fetch("/api/goals/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalText }),
        });

        const result = await response.json();

        setGoals((prev) =>
          prev.map((g) =>
            g.id === newGoal.id
              ? {
                  ...g,
                  validationStatus: result.status,
                  feedback: result.feedback,
                }
              : g
          )
        );

        if (result.status === "valid") {
          showSuccess("Goal looks great!");
        } else if (result.status === "warning") {
          showWarning(result.feedback || "Goal could be improved");
        } else {
          showError(result.feedback || "Goal needs revision");
        }
      } catch {
        showError("Failed to validate goal");
        setGoals((prev) =>
          prev.map((g) =>
            g.id === newGoal.id
              ? { ...g, validationStatus: "warning", feedback: "Validation unavailable" }
              : g
          )
        );
      } finally {
        setIsValidating(false);
      }
    },
    [goals.length, showLoading, showSuccess, showError, showWarning]
  );

  const updateGoal = useCallback(
    async (id: string, text: string) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, text, validationStatus: "pending" } : g
        )
      );

      setIsValidating(true);
      showLoading("Re-validating goal...");

      try {
        const response = await fetch("/api/goals/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalText: text }),
        });

        const result = await response.json();

        setGoals((prev) =>
          prev.map((g) =>
            g.id === id
              ? { ...g, validationStatus: result.status, feedback: result.feedback }
              : g
          )
        );

        if (result.status === "valid") {
          showSuccess("Goal updated successfully!");
        } else if (result.status === "warning") {
          showWarning(result.feedback || "Goal could be improved");
        } else {
          showError(result.feedback || "Goal needs revision");
        }
      } catch {
        showError("Failed to validate goal");
      } finally {
        setIsValidating(false);
      }
    },
    [showLoading, showSuccess, showError, showWarning]
  );

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      return filtered.map((g, idx) => ({ ...g, order: idx + 1 }));
    });
  }, []);

  const handleComplete = useCallback(() => {
    const hasRejected = goals.some((g) => g.validationStatus === "rejected");
    if (hasRejected) {
      showError("Please fix rejected goals before continuing");
      return;
    }

    if (goals.length < MIN_GOALS) {
      showWarning(`Please add at least ${MIN_GOALS} goals`);
      return;
    }

    onComplete(goals);
  }, [goals, onComplete, showError, showWarning]);

  const canProceed = goals.length >= MIN_GOALS && !goals.some((g) => g.validationStatus === "rejected");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Set Your Goals</h2>
        <p className="mt-1 text-muted-foreground">
          Add {MIN_GOALS}-{MAX_GOALS} goals for your Expert Council to review
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: MAX_GOALS }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-2 w-8 rounded-full transition-colors",
              idx < goals.length
                ? goals[idx].validationStatus === "valid"
                  ? "bg-green-500"
                  : goals[idx].validationStatus === "warning"
                  ? "bg-yellow-500"
                  : goals[idx].validationStatus === "rejected"
                  ? "bg-red-500"
                  : "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map((goal, idx) => (
          <GoalInput
            key={goal.id}
            goal={goal}
            index={idx}
            onUpdate={(text) => updateGoal(goal.id, text)}
            onRemove={() => removeGoal(goal.id)}
            disabled={isValidating}
          />
        ))}
      </div>

      {/* Add goal button */}
      {goals.length < MAX_GOALS && (
        <MysticalGoalButton
          onSubmit={addGoal}
          placeholder={
            goals.length === 0
              ? "What's your first goal?"
              : `Add goal ${goals.length + 1} of ${MAX_GOALS}`
          }
          isLoading={isValidating}
          disabled={isValidating}
        />
      )}

      {/* Feedback notice */}
      <LipNotice
        type={notice.type}
        message={notice.message}
        show={notice.show}
        onDismiss={hideNotice}
        autoHide
        autoHideDelay={4000}
      />

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={onCancel}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {goals.length}/{MIN_GOALS} minimum
          </span>
          <Button onClick={handleComplete} disabled={!canProceed || isValidating}>
            Continue to Expert Selection
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
