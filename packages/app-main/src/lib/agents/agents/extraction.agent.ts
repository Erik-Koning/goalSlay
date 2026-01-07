import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { models } from "../config/models";
import { ACTIVITY_EXTRACTION_PROMPT } from "../prompts/templates/extraction";
import type { DailyUpdateInput, ExtractedActivityResult } from "../types";

export interface ExtractionInput extends DailyUpdateInput {
  goals: Array<{ id: string; goalText: string }>;
}

export interface ExtractionOutput {
  updateId: string;
  activities: ExtractedActivityResult[];
}

export async function extractActivities(input: ExtractionInput): Promise<ExtractionOutput> {
  const model = models.extraction();

  // Format goals for the prompt
  const formattedGoals = input.goals
    .map((goal) => `- ${goal.id}: ${goal.goalText}`)
    .join("\n");

  const prompt = ACTIVITY_EXTRACTION_PROMPT
    .replace("{updateText}", input.updateText)
    .replace("{updatePeriod}", input.updatePeriod)
    .replace("{periodDate}", input.periodDate.toISOString().split("T")[0])
    .replace("{goals}", formattedGoals);

  const response = await model.invoke([
    new SystemMessage("You are an activity extraction assistant. Output valid JSON only."),
    new HumanMessage(prompt),
  ]);

  try {
    const content = response.content as string;
    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const parsed = JSON.parse(jsonStr);

    const activities: ExtractedActivityResult[] = (parsed.activities || []).map(
      (activity: Record<string, unknown>) => ({
        activityType: activity.activityType as ExtractedActivityResult["activityType"],
        quantity: Number(activity.quantity) || 1,
        summary: String(activity.summary || ""),
        linkedGoalId: activity.linkedGoalId ? String(activity.linkedGoalId) : undefined,
      })
    );

    return {
      updateId: input.updateId,
      activities,
    };
  } catch {
    return {
      updateId: input.updateId,
      activities: [],
    };
  }
}
