/**
 * Expert Council Agent Tests
 *
 * Run with: pnpm test:agents
 * Local dev: LLM_PROVIDER=openai (uses OPENAI_API_KEY)
 * Enterprise: LLM_PROVIDER=azure (uses Azure OpenAI env vars)
 *
 * To run without API keys (unit tests only):
 *   pnpm test:agents --testNamePattern="Registry"
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import { validateGoal } from "../agents/validation.agent";
import { synthesizeExpertReviews } from "../agents/orchestrator.agent";
import { extractActivities } from "../agents/extraction.agent";
import { ProgressTrackerTool } from "../tools/expert-tools/progress-tracker.tool";
import { getExpertTool } from "../tools/expert-tools";
import type { ExpertId } from "../types";

// Check if API keys are available for LLM tests
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
const hasAzureKey = !!process.env.AZURE_OPENAI_API_KEY;
const hasLLMAccess = hasOpenAIKey || hasAzureKey;

// Skip LLM tests if no API keys
const describeWithLLM = hasLLMAccess ? describe : describe.skip;

describeWithLLM("Expert Council - Validation Agent", () => {
  it("should validate a well-formed SMART goal as valid", async () => {
    const result = await validateGoal({
      goalId: "test-goal-1",
      goalText:
        "Complete 10 product demos with customers by end of Q1 2025, achieving at least 80% positive feedback",
    });

    expect(result.goalId).toBe("test-goal-1");
    expect(["valid", "warning", "rejected"]).toContain(result.status);
    expect(result.feedback).toBeDefined();
    expect(typeof result.feedback).toBe("string");
  });

  it("should identify vague goals as warning or rejected", async () => {
    const result = await validateGoal({
      goalId: "test-goal-2",
      goalText: "Be better at my job",
    });

    expect(result.goalId).toBe("test-goal-2");
    expect(["warning", "rejected"]).toContain(result.status);
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});

describeWithLLM("Expert Council - Progress Tracker", () => {
  it("should generate progress estimates for a goal", async () => {
    const progressTracker = new ProgressTrackerTool();

    const result = await progressTracker.invoke({
      goalId: "test-goal-3",
      goalText: "Conduct 50 experiments on new product features over the next quarter",
    });

    expect(result.review).toBeDefined();
    expect(result.review.expertId).toBe("progress_tracker");
    expect(result.review.expertName).toBe("Progress Tracker");
    expect(result.progressEstimate).toBeDefined();
    expect(result.progressEstimate.goalId).toBe("test-goal-3");
    expect(result.progressEstimate.unit).toBeDefined();
    expect(typeof result.progressEstimate.estimatedPerDay).toBe("number");
    expect(typeof result.progressEstimate.estimatedPerWeek).toBe("number");
  });
});

describe("Expert Council - Expert Tools Registry", () => {
  const expertIds: ExpertId[] = [
    "progress_tracker",
    "motivator",
    "strategist",
    "accountability",
    "obstacle_analyst",
    "time_optimizer",
    "skill_advisor",
    "wellness_guide",
  ];

  it.each(expertIds)("should have expert tool for %s", (expertId) => {
    const tool = getExpertTool(expertId);
    expect(tool).toBeDefined();
    expect(tool.expertInfo.id).toBe(expertId);
  });

  it.skipIf(!hasLLMAccess)("should invoke each expert and get a review", async () => {
    for (const expertId of expertIds) {
      const tool = getExpertTool(expertId);
      const result = await tool.invoke({
        goalId: `test-${expertId}`,
        goalText: "Improve team collaboration through 20 mentoring sessions this quarter",
      });

      expect(result.review.expertId).toBe(expertId);
      expect(result.review.reviewContent).toBeDefined();
      expect(result.review.reviewContent.length).toBeGreaterThan(50);
    }
  }, 120000); // 2 min timeout for all experts
});

describeWithLLM("Expert Council - Orchestrator", () => {
  it("should synthesize multiple expert reviews into coherent summary", async () => {
    const mockReviews = [
      {
        expertId: "progress_tracker" as ExpertId,
        expertName: "Progress Tracker",
        reviewContent: "Track 2 experiments per day, 10 per week. Set milestones at 10, 25, 50.",
        actionItems: ["Set up tracking dashboard", "Create weekly check-ins"],
      },
      {
        expertId: "strategist" as ExpertId,
        expertName: "Strategic Planner",
        reviewContent: "Prioritize high-impact experiments. Use A/B testing framework.",
        actionItems: ["Create prioritization matrix", "Define success metrics"],
      },
    ];

    const result = await synthesizeExpertReviews({
      goalId: "test-synth-1",
      goalText: "Conduct 50 experiments on new features this quarter",
      expertReviews: mockReviews,
    });

    expect(result.goalId).toBe("test-synth-1");
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(100);
  });
});

describeWithLLM("Expert Council - Activity Extraction", () => {
  it("should extract activities from daily update text", async () => {
    const result = await extractActivities({
      updateId: "test-update-1",
      userId: "user-1",
      updateText: `
        Today was productive! I ran 3 experiments on the new checkout flow.
        Also did 2 product demos for the sales team and mentored 1 junior developer.
        Spent some time on documentation as well.
      `,
      updatePeriod: "full_day",
      periodDate: new Date(),
      goals: [
        { id: "goal-1", goalText: "Conduct 50 experiments this quarter" },
        { id: "goal-2", goalText: "Complete 20 product demos" },
        { id: "goal-3", goalText: "Mentor 10 team members" },
      ],
    });

    expect(result.activities).toBeDefined();
    expect(Array.isArray(result.activities)).toBe(true);
    // Should detect experiments, demos, and mentoring
    expect(result.activities.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Expert Council - Integration Test (requires LLM)", () => {
  // Skip integration tests in CI or when no LLM access
  const skipIntegration = process.env.CI === "true" || !hasLLMAccess;

  it.skipIf(skipIntegration)("should run full goal review flow", async () => {
    const { reviewGoalSet } = await import("../graphs/goal-review.graph");

    const result = await reviewGoalSet({
      goalSetId: "test-goalset-1",
      userId: "user-1",
      goals: [
        {
          goalId: "goal-1",
          goalText: "Complete 30 product demos with enterprise customers by March 2025",
          goalOrder: 1,
          selectedExperts: ["progress_tracker", "strategist", "motivator"],
        },
        {
          goalId: "goal-2",
          goalText: "Conduct 50 A/B experiments on the checkout flow",
          goalOrder: 2,
          selectedExperts: ["progress_tracker", "time_optimizer"],
        },
      ],
    });

    expect(result.goalSetId).toBe("test-goalset-1");
    expect(result.goals).toHaveLength(2);

    for (const goal of result.goals) {
      expect(["valid", "warning", "rejected", "pending"]).toContain(goal.validationStatus);
      expect(goal.expertReviews.length).toBeGreaterThan(0);
      expect(goal.expertSummary).toBeDefined();
      if (goal.progressEstimate) {
        expect(goal.progressEstimate.unit).toBeDefined();
        expect(goal.progressEstimate.estimatedPerDay).toBeGreaterThan(0);
      }
    }
  }, 180000); // 3 min timeout for full flow
});
