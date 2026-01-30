"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  IconSparkles,
  IconLoader2,
  IconCheck,
  IconX,
  IconArrowRight,
  IconBulb,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface GoalRevisionPanelProps {
  title: string;
  description: string;
  onAccept: (revisedTitle: string, revisedDescription: string) => void;
  onReject: () => void;
  className?: string;
}

interface RevisionResult {
  original_title: string;
  original_description: string;
  revised_title: string;
  revised_description: string;
  improvements: string[];
  specificity_score: number;
}

export function GoalRevisionPanel({
  title,
  description,
  onAccept,
  onReject,
  className,
}: GoalRevisionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [revision, setRevision] = useState<RevisionResult | null>(null);

  const fetchRevision = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/goals/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get revision suggestions");
      }

      const data = await response.json();
      setRevision(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [title, description, isLoading]);

  const handleAccept = useCallback(() => {
    if (revision) {
      onAccept(revision.revised_title, revision.revised_description);
      setRevision(null);
    }
  }, [revision, onAccept]);

  const handleReject = useCallback(() => {
    setRevision(null);
    onReject();
  }, [onReject]);

  if (!revision && !isLoading) {
    return (
      <Button
        variant="outline"
        onClick={fetchRevision}
        className={cn("gap-2", className)}
      >
        <IconSparkles className="h-4 w-4" />
        Get AI Suggestions
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("border-primary/50", className)}>
        <CardContent className="py-8 flex items-center justify-center gap-3">
          <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Analyzing your goal...</span>
        </CardContent>
      </Card>
    );
  }

  if (!revision) return null;

  return (
    <Card className={cn("border-primary/50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Revision Suggestions</CardTitle>
          </div>
          <Badge variant="secondary">
            Specificity: {revision.specificity_score}/10
          </Badge>
        </div>
        <CardDescription>
          Here's an improved version of your goal
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comparison */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Original */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Original</h4>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="font-medium">{revision.original_title}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {revision.original_description}
              </p>
            </div>
          </div>

          {/* Revised */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-primary">Revised</h4>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
              <p className="font-medium">{revision.revised_title}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {revision.revised_description}
              </p>
            </div>
          </div>
        </div>

        {/* Improvements */}
        {revision.improvements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconBulb className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-medium">Improvements Made</h4>
            </div>
            <ul className="space-y-1">
              {revision.improvements.map((improvement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <IconArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleReject}>
            <IconX className="mr-2 h-4 w-4" />
            Keep Original
          </Button>
          <Button onClick={handleAccept}>
            <IconCheck className="mr-2 h-4 w-4" />
            Use Revised Version
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
