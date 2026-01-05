"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { cn } from "@common/lib/utils";
import { Label } from "./Label";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, Loader, X } from "lucide-react";

type ProcessState = "waiting" | "processing" | "background" | "complete";

export interface ProcessItem {
  id: string;
  icon: React.ReactNode | string;
  title: string;
  subtitle: string;
  isBackground?: boolean;
}

interface LoadingProcessProps {
  items: ProcessItem[];
  states?: ProcessState[];
  title?: string;
  description?: string;
  onComplete?: () => void;
}

export function LoadingProcess({
  items,
  states,
  title = "Retrieving Client Profile",
  description = "Connecting to multiple data sources to build comprehensive client profile...",
  onComplete,
}: LoadingProcessProps) {
  const [currentStates, setCurrentStates] = useState<ProcessState[]>(states || items.map(() => "waiting"));

  // Auto-progression logic when states prop is not provided
  useEffect(() => {
    if (states) return; // Don't auto-progress if states are controlled

    let currentIndex = 0;
    let interval: NodeJS.Timeout | null = null;

    const advanceState = () => {
      setCurrentStates((prev) => {
        const newStates = [...prev];

        // Mark the previous one (if it exists) as complete or background
        if (currentIndex > 0) {
          const prevItem = items[currentIndex - 1];
          newStates[currentIndex - 1] = prevItem.isBackground ? "background" : "complete";
        }

        // If we're past the last item, stop the interval
        if (currentIndex >= items.length) {
          if (interval) clearInterval(interval);
          return newStates;
        }

        // Mark the current one as processing
        newStates[currentIndex] = "processing";
        return newStates;
      });
      currentIndex++;
      if (currentIndex >= items.length) {
        onComplete?.();
      }
    };

    // Start the first item immediately
    advanceState();

    interval = setInterval(advanceState, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [states, items.length]);

  // Calculate progress percentage
  const completedCount = currentStates.filter((state) => state === "complete" || state === "background").length;
  const progress = (completedCount / items.length) * 100;

  const getStateStyles = (state: ProcessState) => {
    switch (state) {
      case "waiting":
        return "bg-gray-100 border-gray-200";
      case "processing":
        return "bg-orange-50 border-orange-300";
      case "background":
        return "bg-gradient-to-r from-faintGreen to-gray-100 border-green";
      case "complete":
        return "bg-faintGreen border border-green";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getStateBadgeStyles = (state: ProcessState) => {
    switch (state) {
      case "processing":
        return "text-orange-600 bg-orange-50";
      case "complete":
        return "text-green bg-muteGreen";
      case "background":
        return "text-green-600 bg-muteGreen";
      case "waiting":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600";
    }
  };

  const getStateBadge = (state: ProcessState) => {
    switch (state) {
      case "processing":
        return <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Processing</span>;
      case "complete":
        return <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Complete</span>;
      case "background":
        return (
          <span className="flex items-center text-xs font-semibold text-green-600 uppercase tracking-wide">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Completing In Background
          </span>
        );
      case "waiting":
        return <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Waiting</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-white rounded-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
          <span className="text-4xl">
            <Search />
          </span>
          {title}
        </h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-center text-sm text-gray-600 mt-2 font-medium">{Math.round(progress)}% Complete</p>
      </div>

      {/* Process Items */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const state = currentStates[index];
          const isProcessing = state === "processing";

          return (
            <div key={item.id} className={cn("flex items-center gap-4 p-6 rounded-lg border-2 transition-all duration-300", getStateStyles(state))}>
              {/* Icon with pulsing ring for processing state */}
              <div className="relative flex-shrink-0">
                {isProcessing && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75" />
                    <div className="absolute inset-0 rounded-full bg-orange-300 animate-pulse" />
                  </>
                )}
                <div className={cn("relative w-12 h-12 flex items-center justify-center text-2xl", isProcessing && "scale-110 transition-transform")}>
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.subtitle}</p>
              </div>

              {/* State Badge */}
              <Label className={cn(getStateBadgeStyles(state))}>{getStateBadge(state)}</Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
