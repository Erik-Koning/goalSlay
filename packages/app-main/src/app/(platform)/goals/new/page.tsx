"use client";

import { GoalCreationWizard } from "@/components/goals/GoalCreationWizard";

export default function NewGoalPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create a New Goal</h1>
        <p className="text-muted-foreground mt-2">
          Define your goal and get expert feedback from our AI council
        </p>
      </div>

      <GoalCreationWizard />
    </div>
  );
}
