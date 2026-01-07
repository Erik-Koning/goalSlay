import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { models } from "../config/models";
import { ORCHESTRATOR_SYSTEM_PROMPT, ORCHESTRATOR_SYNTHESIS_PROMPT } from "../prompts/templates/orchestrator";
import type { ExpertReviewResult } from "../types";

export interface SynthesisInput {
  goalId: string;
  goalText: string;
  expertReviews: ExpertReviewResult[];
}

export interface SynthesisOutput {
  goalId: string;
  summary: string;
}

export async function synthesizeExpertReviews(input: SynthesisInput): Promise<SynthesisOutput> {
  const model = models.orchestrator();

  // Format expert reviews for the prompt
  const formattedReviews = input.expertReviews
    .map((review) => `### ${review.expertName}\n${review.reviewContent}`)
    .join("\n\n---\n\n");

  const prompt = ORCHESTRATOR_SYNTHESIS_PROMPT
    .replace("{goalText}", input.goalText)
    .replace("{expertReviews}", formattedReviews);

  const response = await model.invoke([
    new SystemMessage(ORCHESTRATOR_SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  return {
    goalId: input.goalId,
    summary: response.content as string,
  };
}

export async function synthesizeAllGoals(
  goals: Array<{ goalId: string; goalText: string; expertReviews: ExpertReviewResult[] }>
): Promise<SynthesisOutput[]> {
  // Synthesize in parallel
  const results = await Promise.all(
    goals.map((goal) =>
      synthesizeExpertReviews({
        goalId: goal.goalId,
        goalText: goal.goalText,
        expertReviews: goal.expertReviews,
      })
    )
  );
  return results;
}
