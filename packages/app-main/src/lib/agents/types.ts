// Expert IDs
export const EXPERT_IDS = {
  PROGRESS_TRACKER: "progress_tracker",
  MOTIVATOR: "motivator",
  STRATEGIST: "strategist",
  ACCOUNTABILITY: "accountability",
  OBSTACLE_ANALYST: "obstacle_analyst",
  TIME_OPTIMIZER: "time_optimizer",
  SKILL_ADVISOR: "skill_advisor",
  WELLNESS_GUIDE: "wellness_guide",
} as const;

export type ExpertId = (typeof EXPERT_IDS)[keyof typeof EXPERT_IDS];

// Expert metadata
export interface ExpertInfo {
  id: ExpertId;
  name: string;
  description: string;
  icon: string;
  isRequired: boolean;
}

export const EXPERTS: Record<ExpertId, ExpertInfo> = {
  [EXPERT_IDS.PROGRESS_TRACKER]: {
    id: EXPERT_IDS.PROGRESS_TRACKER,
    name: "Progress Tracker",
    description: "Defines metrics and estimates daily/weekly progress targets",
    icon: "chart-line",
    isRequired: true,
  },
  [EXPERT_IDS.MOTIVATOR]: {
    id: EXPERT_IDS.MOTIVATOR,
    name: "Motivation Coach",
    description: "Provides psychological strategies and encouragement",
    icon: "heart-handshake",
    isRequired: false,
  },
  [EXPERT_IDS.STRATEGIST]: {
    id: EXPERT_IDS.STRATEGIST,
    name: "Strategic Planner",
    description: "Creates action plans and prioritization strategies",
    icon: "chess",
    isRequired: false,
  },
  [EXPERT_IDS.ACCOUNTABILITY]: {
    id: EXPERT_IDS.ACCOUNTABILITY,
    name: "Accountability Partner",
    description: "Designs check-in structures and commitment devices",
    icon: "users",
    isRequired: false,
  },
  [EXPERT_IDS.OBSTACLE_ANALYST]: {
    id: EXPERT_IDS.OBSTACLE_ANALYST,
    name: "Obstacle Analyst",
    description: "Identifies potential blockers and mitigation strategies",
    icon: "shield-check",
    isRequired: false,
  },
  [EXPERT_IDS.TIME_OPTIMIZER]: {
    id: EXPERT_IDS.TIME_OPTIMIZER,
    name: "Time Optimizer",
    description: "Provides scheduling and time management advice",
    icon: "clock",
    isRequired: false,
  },
  [EXPERT_IDS.SKILL_ADVISOR]: {
    id: EXPERT_IDS.SKILL_ADVISOR,
    name: "Skills Advisor",
    description: "Analyzes skills gaps and recommends learning resources",
    icon: "book",
    isRequired: false,
  },
  [EXPERT_IDS.WELLNESS_GUIDE]: {
    id: EXPERT_IDS.WELLNESS_GUIDE,
    name: "Wellness Guide",
    description: "Focuses on work-life balance and burnout prevention",
    icon: "leaf",
    isRequired: false,
  },
};

// Goal validation status
export type ValidationStatus = "pending" | "valid" | "warning" | "rejected";

// Goal review input
export interface GoalReviewInput {
  goalId: string;
  goalText: string;
  goalOrder: number;
  selectedExperts: ExpertId[];
}

// Goal set review input
export interface GoalSetReviewInput {
  goalSetId: string;
  goals: GoalReviewInput[];
  userId: string;
}

// Expert review result
export interface ExpertReviewResult {
  expertId: ExpertId;
  expertName: string;
  reviewContent: string;
  actionItems?: string[];
}

// Progress estimate from Progress Tracker
export interface ProgressEstimate {
  goalId: string;
  unit: string;
  estimatedPerDay: number;
  estimatedPerWeek: number;
}

// Goal validation result
export interface GoalValidationResult {
  goalId: string;
  status: ValidationStatus;
  feedback: string;
}

// Complete review result for a single goal
export interface GoalReviewOutput {
  goalId: string;
  validationStatus: ValidationStatus;
  validationFeedback: string;
  expertSummary: string;
  expertReviews: ExpertReviewResult[];
  progressEstimate?: ProgressEstimate;
}

// Complete review result for a goal set
export interface GoalSetReviewOutput {
  goalSetId: string;
  goals: GoalReviewOutput[];
  overallFeedback: string;
}

// Daily update input
export interface DailyUpdateInput {
  updateId: string;
  userId: string;
  goalSetId: string;
  updateText: string;
  updatePeriod: "morning" | "afternoon" | "evening" | "full_day";
  periodDate: Date;
}

// Extracted activity from daily update
export interface ExtractedActivityResult {
  activityType: "experiments" | "product_demos" | "mentoring" | "presentations" | "volunteering";
  quantity: number;
  summary: string;
  linkedGoalId?: string;
}

// Daily update extraction result
export interface DailyUpdateExtractionOutput {
  updateId: string;
  activities: ExtractedActivityResult[];
}

// LangGraph state types
export interface GoalReviewState {
  input: GoalSetReviewInput;
  currentGoalIndex: number;
  validationResults: GoalValidationResult[];
  expertReviews: Record<string, ExpertReviewResult[]>;
  progressEstimates: ProgressEstimate[];
  expertSummaries: Record<string, string>;
  isComplete: boolean;
  error?: string;
}

export interface DailyUpdateState {
  input: DailyUpdateInput;
  extractedActivities: ExtractedActivityResult[];
  isComplete: boolean;
  error?: string;
}
