"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
  IconChevronDown,
  IconChevronUp,
  IconBulb,
  IconStar,
} from "@tabler/icons-react";
import { useState } from "react";

interface ExpertFeedbackCardProps {
  expert: {
    expertId: string;
    expertName: string;
    score?: number | null;
    feedback?: string | null;
    reviewContent: string;
    suggestions?: string | null;
    actionItems?: string | null;
  };
  className?: string;
  defaultExpanded?: boolean;
}

// Expert emoji mapping
const EXPERT_EMOJIS: Record<string, string> = {
  strategist: "♟️",
  motivator: "🔥",
  obstacle_analyst: "🔍",
  progress_tracker: "📊",
  skill_advisor: "🎓",
  time_optimizer: "⏰",
  wellness_guide: "🌿",
  accountability: "🤝",
  resource_planner: "💰",
  milestone_designer: "🗺️",
  success_definer: "🏆",
};

// Score color mapping
function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 8) return "bg-green-100";
  if (score >= 6) return "bg-amber-100";
  return "bg-red-100";
}

export function ExpertFeedbackCard({
  expert,
  className,
  defaultExpanded = false,
}: ExpertFeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const emoji = EXPERT_EMOJIS[expert.expertId] || "🎯";
  const score = expert.score ?? 5;
  const scorePercentage = (score / 10) * 100;

  // Parse suggestions/actionItems (they might be JSON strings)
  let suggestions: string[] = [];
  try {
    if (expert.suggestions) {
      const parsed = JSON.parse(expert.suggestions);
      suggestions = Array.isArray(parsed) ? parsed : [];
    } else if (expert.actionItems) {
      const parsed = JSON.parse(expert.actionItems);
      suggestions = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // If not JSON, treat as single suggestion
    if (expert.suggestions) {
      suggestions = [expert.suggestions];
    }
  }

  const feedback = expert.feedback || expert.reviewContent;

  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <CardTitle className="text-base">{expert.expertName}</CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Score */}
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
              getScoreBg(score)
            )}>
              <IconStar className={cn("h-4 w-4", getScoreColor(score))} />
              <span className={cn("font-semibold text-sm", getScoreColor(score))}>
                {score}/10
              </span>
            </div>

            {/* Expand toggle */}
            {isExpanded ? (
              <IconChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <IconChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Score bar (always visible) */}
        <Progress value={scorePercentage} className="h-1.5 mt-2" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Feedback */}
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {feedback}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconBulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Suggestions</span>
              </div>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-3"
                  >
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
