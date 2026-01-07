"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconLoader2,
  IconTrash,
  IconEdit,
  IconGripVertical,
} from "@tabler/icons-react";

interface GoalDraft {
  id: string;
  text: string;
  order: number;
  validationStatus: "pending" | "valid" | "warning" | "rejected";
  feedback?: string;
}

interface GoalInputProps {
  goal: GoalDraft;
  index: number;
  onUpdate: (text: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    icon: IconLoader2,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-muted",
    animate: true,
  },
  valid: {
    icon: IconCheck,
    color: "text-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    animate: false,
  },
  warning: {
    icon: IconAlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    animate: false,
  },
  rejected: {
    icon: IconX,
    color: "text-red-600",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    animate: false,
  },
};

export function GoalInput({ goal, index, onUpdate, onRemove, disabled }: GoalInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(goal.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = STATUS_CONFIG[goal.validationStatus];
  const StatusIcon = config.icon;

  const handleSave = () => {
    if (editText.trim() !== goal.text) {
      onUpdate(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditText(goal.text);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setEditText(goal.text);
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all",
        config.bg,
        config.border,
        isEditing && "ring-2 ring-primary"
      )}
    >
      {/* Drag handle and order */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
        <IconGripVertical className="h-4 w-4 cursor-grab" />
        <span className="text-xs font-medium">{index + 1}</span>
      </div>

      {/* Content */}
      <div className="ml-8 mr-20">
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="min-h-[60px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
            disabled={disabled}
          />
        ) : (
          <p className="text-sm">{goal.text}</p>
        )}

        {/* Feedback */}
        {goal.feedback && !isEditing && (
          <p className={cn("mt-2 text-xs", config.color)}>{goal.feedback}</p>
        )}
      </div>

      {/* Status and actions */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <StatusIcon
          className={cn("h-5 w-5", config.color, config.animate && "animate-spin")}
        />

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleEdit}
              disabled={disabled}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onRemove}
              disabled={disabled}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Edit hint */}
      {isEditing && (
        <p className="ml-8 mt-2 text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1">Enter</kbd> to save or{" "}
          <kbd className="rounded bg-muted px-1">Esc</kbd> to cancel
        </p>
      )}
    </div>
  );
}
