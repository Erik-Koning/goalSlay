"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { Textarea } from "@/src/components/ui/textarea";

interface MysticalGoalButtonProps {
  onSubmit: (goalText: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MysticalGoalButton({
  onSubmit,
  placeholder = "What do you want to achieve?",
  isLoading = false,
  disabled = false,
  className,
}: MysticalGoalButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [goalText, setGoalText] = useState("");
  const [hoverProgress, setHoverProgress] = useState(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const HOVER_DURATION = 3000; // 3 seconds to expand on hover
  const HOVER_INTERVAL = 50; // Update every 50ms for smooth animation

  const startHoverTimer = useCallback(() => {
    if (isExpanded || disabled) return;

    hoverTimerRef.current = setInterval(() => {
      setHoverProgress((prev) => {
        const next = prev + (HOVER_INTERVAL / HOVER_DURATION) * 100;
        if (next >= 100) {
          clearInterval(hoverTimerRef.current!);
          setIsExpanded(true);
          return 0;
        }
        return next;
      });
    }, HOVER_INTERVAL);
  }, [isExpanded, disabled]);

  const stopHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearInterval(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoverProgress(0);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    stopHoverTimer();
    setIsExpanded(true);
  }, [disabled, stopHoverTimer]);

  const handleSubmit = useCallback(() => {
    if (goalText.trim() && !isLoading) {
      onSubmit(goalText.trim());
    }
  }, [goalText, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        setIsExpanded(false);
        setGoalText("");
      }
    },
    [handleSubmit]
  );

  // Focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearInterval(hoverTimerRef.current);
      }
    };
  }, []);

  if (isExpanded) {
    return (
      <div
        className={cn(
          "relative w-full animate-in fade-in-0 zoom-in-95 duration-300",
          className
        )}
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            className={cn(
              "min-h-[120px] resize-none pr-12 text-lg",
              "border-2 border-primary/50 focus:border-primary",
              "bg-gradient-to-br from-background to-primary/5",
              "transition-all duration-300"
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!goalText.trim() || isLoading || disabled}
            className={cn(
              "absolute bottom-3 right-3 rounded-full p-2",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-50",
              "transition-all duration-200"
            )}
          >
            {isLoading ? (
              <IconLoader2 className="h-5 w-5 animate-spin" />
            ) : (
              <IconSparkles className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1">Enter</kbd> to submit or{" "}
          <kbd className="rounded bg-muted px-1">Esc</kbd> to cancel
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={startHoverTimer}
      onMouseLeave={stopHoverTimer}
      disabled={disabled}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl p-6",
        "bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10",
        "border-2 border-dashed border-primary/30",
        "hover:border-primary/60 hover:from-primary/20 hover:via-primary/30 hover:to-primary/20",
        "transition-all duration-500 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {/* Hover progress indicator */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/50 transition-transform duration-100 ease-linear"
        style={{
          transform: `translateX(-${100 - hoverProgress}%)`,
        }}
      />

      {/* Sparkle effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-2 left-4 h-2 w-2 animate-pulse rounded-full bg-primary/60" />
        <div className="absolute top-4 right-8 h-1.5 w-1.5 animate-pulse rounded-full bg-primary/40 delay-100" />
        <div className="absolute bottom-3 left-12 h-1 w-1 animate-pulse rounded-full bg-primary/50 delay-200" />
        <div className="absolute bottom-4 right-4 h-2 w-2 animate-pulse rounded-full bg-primary/60 delay-300" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center gap-3">
        <IconSparkles className="h-6 w-6 text-primary group-hover:animate-bounce" />
        <span className="text-lg font-medium text-primary">
          {placeholder}
        </span>
      </div>

      {/* Hover hint */}
      <p className="relative mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        Click or hold to start writing your goal
      </p>
    </button>
  );
}
