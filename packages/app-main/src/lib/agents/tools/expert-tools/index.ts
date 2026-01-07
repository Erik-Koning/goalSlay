import { BaseExpertTool } from "./base-expert";
import { ProgressTrackerTool, progressTrackerTool } from "./progress-tracker.tool";
import { EXPERT_IDS, ExpertId } from "../../types";
import { MOTIVATOR_PROMPT } from "../../prompts/experts/motivator";
import { STRATEGIST_PROMPT } from "../../prompts/experts/strategist";
import { ACCOUNTABILITY_PROMPT } from "../../prompts/experts/accountability";
import { OBSTACLE_ANALYST_PROMPT } from "../../prompts/experts/obstacle-analyst";
import { TIME_OPTIMIZER_PROMPT } from "../../prompts/experts/time-optimizer";
import { SKILL_ADVISOR_PROMPT } from "../../prompts/experts/skill-advisor";
import { WELLNESS_GUIDE_PROMPT } from "../../prompts/experts/wellness-guide";

// Generic expert tool for non-specialized experts
class GenericExpertTool extends BaseExpertTool {
  constructor(expertId: ExpertId, systemPrompt: string) {
    super(expertId, systemPrompt);
  }
}

// Create expert tools
const motivatorTool = new GenericExpertTool(EXPERT_IDS.MOTIVATOR, MOTIVATOR_PROMPT);
const strategistTool = new GenericExpertTool(EXPERT_IDS.STRATEGIST, STRATEGIST_PROMPT);
const accountabilityTool = new GenericExpertTool(EXPERT_IDS.ACCOUNTABILITY, ACCOUNTABILITY_PROMPT);
const obstacleAnalystTool = new GenericExpertTool(EXPERT_IDS.OBSTACLE_ANALYST, OBSTACLE_ANALYST_PROMPT);
const timeOptimizerTool = new GenericExpertTool(EXPERT_IDS.TIME_OPTIMIZER, TIME_OPTIMIZER_PROMPT);
const skillAdvisorTool = new GenericExpertTool(EXPERT_IDS.SKILL_ADVISOR, SKILL_ADVISOR_PROMPT);
const wellnessGuideTool = new GenericExpertTool(EXPERT_IDS.WELLNESS_GUIDE, WELLNESS_GUIDE_PROMPT);

// Expert tools registry
export const expertTools: Record<ExpertId, BaseExpertTool> = {
  [EXPERT_IDS.PROGRESS_TRACKER]: progressTrackerTool,
  [EXPERT_IDS.MOTIVATOR]: motivatorTool,
  [EXPERT_IDS.STRATEGIST]: strategistTool,
  [EXPERT_IDS.ACCOUNTABILITY]: accountabilityTool,
  [EXPERT_IDS.OBSTACLE_ANALYST]: obstacleAnalystTool,
  [EXPERT_IDS.TIME_OPTIMIZER]: timeOptimizerTool,
  [EXPERT_IDS.SKILL_ADVISOR]: skillAdvisorTool,
  [EXPERT_IDS.WELLNESS_GUIDE]: wellnessGuideTool,
};

export function getExpertTool(expertId: ExpertId): BaseExpertTool {
  const tool = expertTools[expertId];
  if (!tool) {
    throw new Error(`Unknown expert ID: ${expertId}`);
  }
  return tool;
}

export { BaseExpertTool, ProgressTrackerTool, progressTrackerTool };
