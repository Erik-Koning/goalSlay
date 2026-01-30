"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import {
  IconSun,
  IconSunset,
  IconMoon,
  IconCalendar,
  IconSend,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react";

type UpdatePeriod = "morning" | "afternoon" | "evening" | "full_day";

interface DailyUpdateFormProps {
  goalSetId: string;
  onSuccess?: () => void;
  className?: string;
}

const PERIODS: Array<{
  id: UpdatePeriod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  time: string;
}> = [
  { id: "morning", label: "Morning", icon: IconSun, time: "Before noon" },
  { id: "afternoon", label: "Afternoon", icon: IconSunset, time: "12pm - 5pm" },
  { id: "evening", label: "Evening", icon: IconMoon, time: "After 5pm" },
  { id: "full_day", label: "Full Day", icon: IconCalendar, time: "Summary" },
];

function getCurrentPeriod(): UpdatePeriod {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function DailyUpdateForm({ goalSetId, onSuccess, className }: DailyUpdateFormProps) {
  const [updateText, setUpdateText] = useState("");
  const [period, setPeriod] = useState<UpdatePeriod>(getCurrentPeriod());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!updateText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/daily-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalSetId,
          updateText: updateText.trim(),
          updatePeriod: period,
          periodDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit update");
      }

      toast.success("Update submitted successfully!");
      setUpdateText("");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit update");
    } finally {
      setIsSubmitting(false);
    }
  }, [updateText, period, goalSetId, isSubmitting, onSuccess]);

  const isLoading = isSubmitting;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Period selector */}
      <div className="flex items-center justify-center gap-2">
        {PERIODS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all",
                period === p.id
                  ? "border-primary bg-primary/10"
                  : "border-transparent hover:border-muted hover:bg-muted/50"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  period === p.id ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  period === p.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Update input */}
      <div className="relative">
        <Textarea
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          placeholder="What did you work on? What progress did you make? Any blockers?"
          disabled={isLoading}
          className="min-h-[150px] resize-none pb-12"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {updateText.length} characters
          </span>
          <Button
            onClick={handleSubmit}
            disabled={updateText.trim().length < 10 || isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IconSend className="mr-2 h-4 w-4" />
                Submit Update
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <IconSparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Tips for great updates</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• Be specific about what you accomplished</li>
              <li>• Include numbers when possible (e.g., "completed 2 experiments")</li>
              <li>• Mention any blockers or challenges</li>
              <li>• Note learnings or insights from your work</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
