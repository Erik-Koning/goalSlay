"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { ExpertFeedbackCard } from "./ExpertFeedbackCard";
import {
  IconUsers,
  IconStar,
  IconRefresh,
  IconLoader2,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface ExpertReview {
  id: string;
  expertId: string;
  expertName: string;
  score?: number | null;
  feedback?: string | null;
  reviewContent: string;
  suggestions?: string | null;
  actionItems?: string | null;
}

interface ExpertReviewPanelProps {
  goalId: string;
  councilScore?: number | null;
  expertSummary?: string | null;
  expertReviews: ExpertReview[];
  className?: string;
  onReviewComplete?: () => void;
}

export function ExpertReviewPanel({
  goalId,
  councilScore,
  expertSummary,
  expertReviews,
  className,
  onReviewComplete,
}: ExpertReviewPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllExperts, setShowAllExperts] = useState(false);

  const hasReviews = expertReviews.length > 0;
  const scorePercentage = councilScore ? (councilScore / 10) * 100 : 0;

  // Sort by score (highest first)
  const sortedReviews = [...expertReviews].sort((a, b) => {
    const scoreA = a.score ?? 5;
    const scoreB = b.score ?? 5;
    return scoreB - scoreA;
  });

  const displayedReviews = showAllExperts ? sortedReviews : sortedReviews.slice(0, 3);

  const handleRequestReview = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const response = await fetch(`/api/goals/${goalId}/review`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get expert review");
      }

      toast.success("Expert Council review complete!");
      onReviewComplete?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get review");
    } finally {
      setIsRefreshing(false);
    }
  }, [goalId, isRefreshing, onReviewComplete]);

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-primary" />
              <CardTitle>Expert Council Review</CardTitle>
            </div>
            {hasReviews && councilScore && (
              <div className="flex items-center gap-2">
                <IconStar className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className={cn("text-2xl font-bold", getScoreColor(councilScore))}>
                  {councilScore.toFixed(1)}
                </span>
                <span className="text-muted-foreground">/10</span>
              </div>
            )}
          </div>
          {!hasReviews && (
            <CardDescription>
              Get comprehensive feedback from our council of 11 AI expert advisors
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {hasReviews && councilScore ? (
            <>
              {/* Overall score bar */}
              <Progress value={scorePercentage} className="h-2" />

              {/* Summary */}
              {expertSummary && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="text-sm font-medium mb-2">Council Summary</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {expertSummary}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary">
                  {expertReviews.length} expert{expertReviews.length !== 1 ? "s" : ""} reviewed
                </Badge>
                <span className="text-muted-foreground">
                  Avg score: {(expertReviews.reduce((sum, r) => sum + (r.score ?? 5), 0) / expertReviews.length).toFixed(1)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-8 gap-4">
              <IconUsers className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-center">
                No expert reviews yet. Request a review to get comprehensive feedback.
              </p>
            </div>
          )}

          {/* Request/Refresh button */}
          <Button
            variant={hasReviews ? "outline" : "default"}
            onClick={handleRequestReview}
            disabled={isRefreshing}
            className="w-full"
          >
            {isRefreshing ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Consulting Experts...
              </>
            ) : hasReviews ? (
              <>
                <IconRefresh className="mr-2 h-4 w-4" />
                Request New Review
              </>
            ) : (
              <>
                <IconUsers className="mr-2 h-4 w-4" />
                Request Expert Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Individual Expert Cards */}
      {hasReviews && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Expert Feedback</h3>

          {displayedReviews.map((review, index) => (
            <ExpertFeedbackCard
              key={review.id}
              expert={review}
              defaultExpanded={index === 0}
            />
          ))}

          {sortedReviews.length > 3 && (
            <Button
              variant="ghost"
              onClick={() => setShowAllExperts(!showAllExperts)}
              className="w-full"
            >
              {showAllExperts ? (
                <>
                  <IconChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <IconChevronDown className="mr-2 h-4 w-4" />
                  Show {sortedReviews.length - 3} More Experts
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
