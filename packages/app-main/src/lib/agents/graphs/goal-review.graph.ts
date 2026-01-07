import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { validateGoal } from "../agents/validation.agent";
import { synthesizeExpertReviews } from "../agents/orchestrator.agent";
import { getExpertTool } from "../tools/expert-tools";
import { ProgressTrackerTool } from "../tools/expert-tools/progress-tracker.tool";
import type {
  GoalReviewInput,
  GoalSetReviewInput,
  GoalReviewOutput,
  GoalSetReviewOutput,
  ExpertReviewResult,
  ProgressEstimate,
  GoalValidationResult,
  ExpertId,
  EXPERT_IDS,
} from "../types";

// Define the graph state
const GoalReviewStateAnnotation = Annotation.Root({
  input: Annotation<GoalSetReviewInput>,
  currentGoalIndex: Annotation<number>({ default: () => 0 }),
  validationResults: Annotation<GoalValidationResult[]>({ default: () => [] }),
  expertReviews: Annotation<Record<string, ExpertReviewResult[]>>({ default: () => ({}) }),
  progressEstimates: Annotation<ProgressEstimate[]>({ default: () => [] }),
  expertSummaries: Annotation<Record<string, string>>({ default: () => ({}) }),
  output: Annotation<GoalSetReviewOutput | null>({ default: () => null }),
  error: Annotation<string | null>({ default: () => null }),
});

type GoalReviewState = typeof GoalReviewStateAnnotation.State;

// Node: Validate all goals
async function validateGoals(state: GoalReviewState): Promise<Partial<GoalReviewState>> {
  const results: GoalValidationResult[] = [];

  for (const goal of state.input.goals) {
    const result = await validateGoal({
      goalId: goal.goalId,
      goalText: goal.goalText,
    });
    results.push(result);
  }

  return { validationResults: results };
}

// Node: Run expert reviews for current goal
async function runExpertReviews(state: GoalReviewState): Promise<Partial<GoalReviewState>> {
  const goal = state.input.goals[state.currentGoalIndex];
  if (!goal) {
    return { error: "No goal found at current index" };
  }

  const reviews: ExpertReviewResult[] = [];
  let progressEstimate: ProgressEstimate | undefined;

  // Always run Progress Tracker first (required)
  const progressTracker = getExpertTool("progress_tracker" as ExpertId) as ProgressTrackerTool;
  const progressResult = await progressTracker.invoke({
    goalId: goal.goalId,
    goalText: goal.goalText,
  });
  reviews.push(progressResult.review);
  progressEstimate = progressResult.progressEstimate;

  // Run selected optional experts in parallel
  const optionalExperts = goal.selectedExperts.filter((id) => id !== "progress_tracker");
  const expertPromises = optionalExperts.map(async (expertId) => {
    const tool = getExpertTool(expertId);
    const result = await tool.invoke({
      goalId: goal.goalId,
      goalText: goal.goalText,
    });
    return result.review;
  });

  const optionalResults = await Promise.all(expertPromises);
  reviews.push(...optionalResults);

  // Update state
  const newExpertReviews = { ...state.expertReviews, [goal.goalId]: reviews };
  const newProgressEstimates = progressEstimate
    ? [...state.progressEstimates, progressEstimate]
    : state.progressEstimates;

  return {
    expertReviews: newExpertReviews,
    progressEstimates: newProgressEstimates,
  };
}

// Node: Synthesize reviews for current goal
async function synthesizeReviews(state: GoalReviewState): Promise<Partial<GoalReviewState>> {
  const goal = state.input.goals[state.currentGoalIndex];
  if (!goal) {
    return { error: "No goal found at current index" };
  }

  const reviews = state.expertReviews[goal.goalId] || [];
  const synthesis = await synthesizeExpertReviews({
    goalId: goal.goalId,
    goalText: goal.goalText,
    expertReviews: reviews,
  });

  const newSummaries = { ...state.expertSummaries, [goal.goalId]: synthesis.summary };

  return {
    expertSummaries: newSummaries,
    currentGoalIndex: state.currentGoalIndex + 1,
  };
}

// Node: Build final output
function buildOutput(state: GoalReviewState): Partial<GoalReviewState> {
  const goalOutputs: GoalReviewOutput[] = state.input.goals.map((goal) => {
    const validation = state.validationResults.find((v) => v.goalId === goal.goalId);
    const reviews = state.expertReviews[goal.goalId] || [];
    const summary = state.expertSummaries[goal.goalId] || "";
    const estimate = state.progressEstimates.find((e) => e.goalId === goal.goalId);

    return {
      goalId: goal.goalId,
      validationStatus: validation?.status || "pending",
      validationFeedback: validation?.feedback || "",
      expertSummary: summary,
      expertReviews: reviews,
      progressEstimate: estimate,
    };
  });

  return {
    output: {
      goalSetId: state.input.goalSetId,
      goals: goalOutputs,
      overallFeedback: generateOverallFeedback(goalOutputs),
    },
  };
}

function generateOverallFeedback(goals: GoalReviewOutput[]): string {
  const validCount = goals.filter((g) => g.validationStatus === "valid").length;
  const warningCount = goals.filter((g) => g.validationStatus === "warning").length;
  const rejectedCount = goals.filter((g) => g.validationStatus === "rejected").length;

  if (rejectedCount > 0) {
    return `${rejectedCount} goal(s) need revision before proceeding. Please review the feedback and update your goals.`;
  }
  if (warningCount > 0) {
    return `All goals are acceptable, but ${warningCount} could be improved. Consider the expert suggestions.`;
  }
  return `Excellent! All ${validCount} goals meet SMART criteria. Your Expert Council has provided insights to help you succeed.`;
}

// Conditional: Check if more goals to process
function shouldContinue(state: GoalReviewState): "runExpertReviews" | "buildOutput" {
  if (state.currentGoalIndex < state.input.goals.length) {
    return "runExpertReviews";
  }
  return "buildOutput";
}

// Build the graph
export function createGoalReviewGraph() {
  const workflow = new StateGraph(GoalReviewStateAnnotation)
    .addNode("validateGoals", validateGoals)
    .addNode("runExpertReviews", runExpertReviews)
    .addNode("synthesizeReviews", synthesizeReviews)
    .addNode("buildOutput", buildOutput)
    .addEdge(START, "validateGoals")
    .addEdge("validateGoals", "runExpertReviews")
    .addEdge("runExpertReviews", "synthesizeReviews")
    .addConditionalEdges("synthesizeReviews", shouldContinue)
    .addEdge("buildOutput", END);

  return workflow.compile();
}

// Main entry point
export async function reviewGoalSet(input: GoalSetReviewInput): Promise<GoalSetReviewOutput> {
  const graph = createGoalReviewGraph();

  const result = await graph.invoke({ input });

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.output) {
    throw new Error("Goal review failed to produce output");
  }

  return result.output;
}
