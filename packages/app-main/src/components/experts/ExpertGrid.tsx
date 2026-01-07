"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ExpertCard } from "./ExpertCard";
import { IconArrowLeft, IconArrowRight, IconSparkles } from "@tabler/icons-react";

interface ExpertInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  isRequired: boolean;
}

interface GoalWithExperts {
  id: string;
  text: string;
  order: number;
  selectedExperts: string[];
}

interface ExpertGridProps {
  goals: GoalWithExperts[];
  onComplete: (goals: GoalWithExperts[]) => void;
  onBack: () => void;
  className?: string;
}

export function ExpertGrid({ goals: initialGoals, onComplete, onBack, className }: ExpertGridProps) {
  const [goals, setGoals] = useState<GoalWithExperts[]>(initialGoals);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [experts, setExperts] = useState<ExpertInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentGoal = goals[currentGoalIndex];

  // Fetch available experts
  useEffect(() => {
    async function fetchExperts() {
      try {
        const response = await fetch("/api/goals/experts");
        const data = await response.json();
        setExperts(data.experts);

        // Auto-select required experts for all goals
        setGoals((prev) =>
          prev.map((goal) => ({
            ...goal,
            selectedExperts: [
              ...goal.selectedExperts,
              ...data.experts
                .filter((e: ExpertInfo) => e.isRequired && !goal.selectedExperts.includes(e.id))
                .map((e: ExpertInfo) => e.id),
            ],
          }))
        );
      } catch (error) {
        console.error("Failed to fetch experts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExperts();
  }, []);

  const toggleExpert = useCallback((expertId: string) => {
    setGoals((prev) =>
      prev.map((goal, idx) => {
        if (idx !== currentGoalIndex) return goal;

        const isSelected = goal.selectedExperts.includes(expertId);
        return {
          ...goal,
          selectedExperts: isSelected
            ? goal.selectedExperts.filter((id) => id !== expertId)
            : [...goal.selectedExperts, expertId],
        };
      })
    );
  }, [currentGoalIndex]);

  const applyToAll = useCallback(() => {
    const currentSelections = goals[currentGoalIndex].selectedExperts;
    setGoals((prev) =>
      prev.map((goal) => ({
        ...goal,
        selectedExperts: [...currentSelections],
      }))
    );
  }, [currentGoalIndex, goals]);

  const handleNext = () => {
    if (currentGoalIndex < goals.length - 1) {
      setCurrentGoalIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentGoalIndex > 0) {
      setCurrentGoalIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(goals);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <IconSparkles className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  const isLastGoal = currentGoalIndex === goals.length - 1;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Experts</h2>
        <p className="mt-1 text-muted-foreground">
          Select experts to review each goal. Progress Tracker is always included.
        </p>
      </div>

      {/* Goal selector */}
      <div className="flex items-center justify-center gap-2">
        {goals.map((goal, idx) => (
          <button
            key={goal.id}
            onClick={() => setCurrentGoalIndex(idx)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-all",
              idx === currentGoalIndex
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted hover:border-primary/50"
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Current goal */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium text-muted-foreground">Goal {currentGoal.order}</p>
        <p className="mt-1">{currentGoal.text}</p>
      </div>

      {/* Expert grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {experts.map((expert) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
            isSelected={currentGoal.selectedExperts.includes(expert.id)}
            onToggle={() => toggleExpert(expert.id)}
            disabled={expert.isRequired}
          />
        ))}
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div>
          <p className="text-sm font-medium">
            {currentGoal.selectedExperts.length} expert{currentGoal.selectedExperts.length !== 1 ? "s" : ""} selected
          </p>
          <p className="text-xs text-muted-foreground">
            {experts
              .filter((e) => currentGoal.selectedExperts.includes(e.id))
              .map((e) => e.name)
              .join(", ")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={applyToAll}>
          Apply to all goals
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          {currentGoalIndex === 0 ? (
            <Button variant="ghost" onClick={onBack}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Goals
            </Button>
          ) : (
            <Button variant="ghost" onClick={handlePrev}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Previous Goal
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {!isLastGoal ? (
            <Button onClick={handleNext}>
              Next Goal
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <IconSparkles className="mr-2 h-4 w-4" />
              Start Expert Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
