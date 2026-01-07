import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseExpertTool, ExpertToolInput, ExpertToolOutput } from "./base-expert";
import { EXPERT_IDS, ProgressEstimate } from "../../types";
import { PROGRESS_TRACKER_PROMPT, PROGRESS_TRACKER_EXTRACTION_PROMPT } from "../../prompts/experts/progress-tracker";
import { models } from "../../config/models";

export interface ProgressTrackerOutput extends ExpertToolOutput {
  progressEstimate: ProgressEstimate;
}

export class ProgressTrackerTool extends BaseExpertTool {
  constructor() {
    super(EXPERT_IDS.PROGRESS_TRACKER, PROGRESS_TRACKER_PROMPT);
  }

  async invoke(input: ExpertToolInput): Promise<ProgressTrackerOutput> {
    // Get the standard expert review
    const baseOutput = await super.invoke(input);

    // Extract structured progress estimates
    const progressEstimate = await this.extractProgressEstimate(input);

    return {
      ...baseOutput,
      progressEstimate,
    };
  }

  private async extractProgressEstimate(input: ExpertToolInput): Promise<ProgressEstimate> {
    const extractionModel = models.extraction();

    const prompt = PROGRESS_TRACKER_EXTRACTION_PROMPT.replace("{goalText}", input.goalText);

    const response = await extractionModel.invoke([
      new SystemMessage("You are a progress metrics extraction assistant. Output valid JSON only."),
      new HumanMessage(prompt),
    ]);

    try {
      const content = response.content as string;
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);

      return {
        goalId: input.goalId,
        unit: parsed.unit || "tasks",
        estimatedPerDay: parsed.estimatedPerDay || 1,
        estimatedPerWeek: parsed.estimatedPerWeek || 5,
      };
    } catch {
      // Return sensible defaults if parsing fails
      return {
        goalId: input.goalId,
        unit: "tasks",
        estimatedPerDay: 1,
        estimatedPerWeek: 5,
      };
    }
  }
}

// Export singleton instance
export const progressTrackerTool = new ProgressTrackerTool();
