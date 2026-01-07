import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { models } from "../config/models";
import { GOAL_VALIDATION_PROMPT } from "../prompts/templates/validation";
import type { GoalValidationResult, ValidationStatus } from "../types";

export interface ValidationInput {
  goalId: string;
  goalText: string;
}

export async function validateGoal(input: ValidationInput): Promise<GoalValidationResult> {
  const model = models.validation();

  const prompt = GOAL_VALIDATION_PROMPT.replace("{goalText}", input.goalText);

  const response = await model.invoke([
    new SystemMessage("You are a goal validation expert. Output valid JSON only."),
    new HumanMessage(prompt),
  ]);

  try {
    const content = response.content as string;
    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const parsed = JSON.parse(jsonStr);

    return {
      goalId: input.goalId,
      status: (parsed.status as ValidationStatus) || "warning",
      feedback: parsed.feedback || "Unable to validate goal",
    };
  } catch {
    return {
      goalId: input.goalId,
      status: "warning",
      feedback: "Goal validation encountered an error. Please review the goal manually.",
    };
  }
}

export async function validateGoals(goals: ValidationInput[]): Promise<GoalValidationResult[]> {
  // Validate goals in parallel
  const results = await Promise.all(goals.map(validateGoal));
  return results;
}
