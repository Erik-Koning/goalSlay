"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { IconTrophy, IconFlame, IconMedal, IconLoader2 } from "@tabler/icons-react";

type LeaderboardType = "points" | "streak" | "achievements";

interface LeaderboardEntry {
  id: string;
  name: string;
  image?: string | null;
  totalPoints?: number;
  streakCurrent?: number;
  achievementCount?: number;
}

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [type, setType] = useState<LeaderboardType>("points");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?type=${type}&limit=10`);
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setCurrentUserRank(data.currentUserRank);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [type]);

  const getValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case "points":
        return entry.totalPoints || 0;
      case "streak":
        return entry.streakCurrent || 0;
      case "achievements":
        return entry.achievementCount || 0;
    }
  };

  const getLabel = (value: number) => {
    switch (type) {
      case "points":
        return `${value.toLocaleString()} pts`;
      case "streak":
        return `${value} days`;
      case "achievements":
        return `${value} badges`;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={type} onValueChange={(v) => setType(v as LeaderboardType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="points" className="gap-1">
            <IconTrophy className="h-4 w-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="streak" className="gap-1">
            <IconFlame className="h-4 w-4" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-1">
            <IconMedal className="h-4 w-4" />
            Badges
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-3 transition-colors",
                  isTop3 && "bg-primary/5 border-primary/20"
                )}
              >
                {/* Rank */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    rank === 1 && "bg-yellow-500 text-white",
                    rank === 2 && "bg-gray-400 text-white",
                    rank === 3 && "bg-orange-600 text-white",
                    rank > 3 && "bg-muted text-muted-foreground"
                  )}
                >
                  {rank}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.image || undefined} />
                  <AvatarFallback>
                    {entry.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.name}</p>
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className={cn("font-bold", isTop3 && "text-primary")}>
                    {getLabel(getValue(entry))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current user rank */}
      {currentUserRank > 0 && (
        <div className="rounded-lg border border-dashed p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Your rank: <span className="font-bold text-primary">#{currentUserRank}</span>
          </p>
        </div>
      )}
    </div>
  );
}
