"use client";

import { cn } from "@/lib/utils";
import {
  IconChartLine,
  IconHeart,
  IconChess,
  IconUsers,
  IconShield,
  IconClock,
  IconBook,
  IconLeaf,
  IconCheck,
  IconLock,
} from "@tabler/icons-react";

interface ExpertInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  isRequired: boolean;
}

interface ExpertCardProps {
  expert: ExpertInfo;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "chart-line": IconChartLine,
  "heart-handshake": IconHeart,
  chess: IconChess,
  users: IconUsers,
  "shield-check": IconShield,
  clock: IconClock,
  book: IconBook,
  leaf: IconLeaf,
};

export function ExpertCard({ expert, isSelected, onToggle, disabled }: ExpertCardProps) {
  const Icon = ICON_MAP[expert.icon] || IconUsers;
  const isLocked = expert.isRequired;

  return (
    <button
      onClick={onToggle}
      disabled={disabled || isLocked}
      className={cn(
        "group relative flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all",
        "hover:shadow-lg hover:-translate-y-1",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-muted bg-card hover:border-primary/50",
        isLocked && "cursor-not-allowed",
        disabled && "opacity-50"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1.5 shadow-lg">
          <IconCheck className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      {/* Required badge */}
      {isLocked && (
        <div className="absolute -left-2 -top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white shadow">
          <IconLock className="h-3 w-3" />
          Required
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-4 rounded-full p-4 transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
        )}
      >
        <Icon className="h-8 w-8" />
      </div>

      {/* Name */}
      <h3 className="font-semibold">{expert.name}</h3>

      {/* Description */}
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {expert.description}
      </p>
    </button>
  );
}
