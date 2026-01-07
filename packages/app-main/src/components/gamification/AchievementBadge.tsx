"use client";

import { cn } from "@/lib/utils";
import {
  IconFlame,
  IconTrophy,
  IconTarget,
  IconFlask,
  IconPresentation,
  IconUsers,
  IconMicrophone,
  IconHeart,
  IconStar,
  IconRocket,
  IconCrown,
  IconSunrise,
  IconLock,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  earned: boolean;
  earnedAt?: string | null;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "flame-7": IconFlame,
  "flame-30": IconFlame,
  "flame-100": IconFlame,
  target: IconTarget,
  trophy: IconTrophy,
  crown: IconCrown,
  flask: IconFlask,
  presentation: IconPresentation,
  users: IconUsers,
  "play-circle": IconPresentation,
  heart: IconHeart,
  sunrise: IconSunrise,
  rocket: IconRocket,
  "users-group": IconUsers,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  streak: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
  goals: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  activities: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  special: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30" },
};

export function AchievementBadge({
  achievement,
  size = "md",
  showTooltip = true,
  className,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: { container: "h-10 w-10", icon: "h-5 w-5" },
    md: { container: "h-14 w-14", icon: "h-7 w-7" },
    lg: { container: "h-20 w-20", icon: "h-10 w-10" },
  };

  const classes = sizeClasses[size];
  const Icon = ICON_MAP[achievement.icon] || IconStar;
  const colors = CATEGORY_COLORS[achievement.category] || CATEGORY_COLORS.special;

  const badge = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 transition-all",
        classes.container,
        achievement.earned
          ? [colors.bg, colors.border]
          : "bg-muted/50 border-muted grayscale",
        className
      )}
    >
      <Icon
        className={cn(
          classes.icon,
          achievement.earned ? colors.text : "text-muted-foreground"
        )}
      />
      {!achievement.earned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
          <IconLock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {achievement.earned && (
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          +{achievement.points}
        </div>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            {achievement.earned && achievement.earnedAt && (
              <p className="text-xs text-green-500">
                Earned {new Date(achievement.earnedAt).toLocaleDateString()}
              </p>
            )}
            {!achievement.earned && (
              <p className="text-xs text-muted-foreground">
                +{achievement.points} points when earned
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
