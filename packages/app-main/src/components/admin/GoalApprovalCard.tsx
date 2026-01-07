"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  IconCheck,
  IconX,
  IconEdit,
  IconLoader2,
  IconChartLine,
} from "@tabler/icons-react";

interface Goal {
  id: string;
  goalText: string;
  goalOrder: number;
  validationStatus: string;
  expertSummary?: string | null;
  progressEstimates: Array<{
    unit: string;
    estimatedPerDay: number;
    estimatedPerWeek: number;
  }>;
}

interface GoalSet {
  id: string;
  status: string;
  startDate: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  goals: Goal[];
}

interface GoalApprovalCardProps {
  goalSet: GoalSet;
  onApprove: (goalSetId: string, comment?: string) => Promise<void>;
  onReject: (goalSetId: string, comment?: string) => Promise<void>;
  onRequestChanges: (goalSetId: string, comment?: string) => Promise<void>;
  className?: string;
}

export function GoalApprovalCard({
  goalSet,
  onApprove,
  onReject,
  onRequestChanges,
  className,
}: GoalApprovalCardProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (
    action: "approve" | "reject" | "request_changes",
    handler: (goalSetId: string, comment?: string) => Promise<void>
  ) => {
    setIsLoading(true);
    setLoadingAction(action);
    try {
      await handler(goalSet.id, comment || undefined);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={goalSet.user.image || undefined} />
              <AvatarFallback>
                {goalSet.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{goalSet.user.name}</CardTitle>
              <CardDescription>{goalSet.user.email}</CardDescription>
            </div>
          </div>
          <Badge variant="outline">
            {goalSet.goals.length} goal{goalSet.goals.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Goals list */}
        <div className="space-y-3">
          {goalSet.goals.map((goal) => (
            <div key={goal.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Goal {goal.goalOrder}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.goalText}
                  </p>
                </div>
                <Badge
                  variant={
                    goal.validationStatus === "valid"
                      ? "default"
                      : goal.validationStatus === "warning"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {goal.validationStatus}
                </Badge>
              </div>

              {/* Progress estimate */}
              {goal.progressEstimates?.[0] && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <IconChartLine className="h-4 w-4" />
                  <span>
                    {goal.progressEstimates[0].estimatedPerDay}{" "}
                    {goal.progressEstimates[0].unit}/day
                  </span>
                </div>
              )}

              {/* Expert summary */}
              {goal.expertSummary && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {goal.expertSummary}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium">Comment (optional)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add feedback for the user..."
            className="mt-1"
            disabled={isLoading}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => handleAction("request_changes", onRequestChanges)}
          disabled={isLoading}
        >
          {loadingAction === "request_changes" ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconEdit className="mr-2 h-4 w-4" />
          )}
          Request Changes
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleAction("reject", onReject)}
          disabled={isLoading}
        >
          {loadingAction === "reject" ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconX className="mr-2 h-4 w-4" />
          )}
          Reject
        </Button>
        <Button
          onClick={() => handleAction("approve", onApprove)}
          disabled={isLoading}
        >
          {loadingAction === "approve" ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconCheck className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
