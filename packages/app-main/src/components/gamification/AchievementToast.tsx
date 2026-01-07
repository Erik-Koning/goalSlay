"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconTrophy, IconX, IconSparkles } from "@tabler/icons-react";

interface AchievementToastProps {
  achievement: {
    name: string;
    points: number;
  };
  show: boolean;
  onDismiss: () => void;
  autoHideDelay?: number;
}

export function AchievementToast({
  achievement,
  show,
  onDismiss,
  autoHideDelay = 5000,
}: AchievementToastProps) {
  useEffect(() => {
    if (show && autoHideDelay > 0) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoHideDelay, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={cn(
          "relative flex items-center gap-4 rounded-xl border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 shadow-lg backdrop-blur-sm",
          "max-w-sm"
        )}
      >
        {/* Sparkle effects */}
        <div className="absolute -top-2 -left-2">
          <IconSparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <IconSparkles className="h-4 w-4 text-orange-500 animate-pulse delay-100" />
        </div>

        {/* Trophy icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
          <IconTrophy className="h-6 w-6 text-yellow-500" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
            Achievement Unlocked!
          </p>
          <p className="font-bold">{achievement.name}</p>
          <p className="text-sm text-muted-foreground">
            +{achievement.points} points
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-black/10 transition-colors"
        >
          <IconX className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// Hook for managing achievement toasts
import { useState, useCallback } from "react";

export function useAchievementToast() {
  const [achievement, setAchievement] = useState<{ name: string; points: number } | null>(null);
  const [show, setShow] = useState(false);

  const showAchievement = useCallback((name: string, points: number) => {
    setAchievement({ name, points });
    setShow(true);
  }, []);

  const hideAchievement = useCallback(() => {
    setShow(false);
  }, []);

  return {
    achievement,
    show,
    showAchievement,
    hideAchievement,
  };
}
