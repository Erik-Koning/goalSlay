import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/achievements - Get all achievements and user's earned ones
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active achievements
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { points: "desc" }],
    });

    // Get user's earned achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true, earnedAt: true },
    });

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));
    const earnedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.earnedAt])
    );

    // Combine with earned status
    const achievementsWithStatus = achievements.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earnedMap.get(a.id) || null,
    }));

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        streakCurrent: true,
        streakLongest: true,
        totalPoints: true,
      },
    });

    return NextResponse.json({
      achievements: achievementsWithStatus,
      stats: {
        currentStreak: user?.streakCurrent || 0,
        longestStreak: user?.streakLongest || 0,
        totalPoints: user?.totalPoints || 0,
        achievementsEarned: userAchievements.length,
        achievementsTotal: achievements.length,
      },
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements/check - Check and award any earned achievements
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newlyEarned = await checkAndAwardAchievements(session.user.id);

    return NextResponse.json({ newlyEarned });
  } catch (error) {
    console.error("Error checking achievements:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(userId: string) {
  const newlyEarned: Array<{ id: string; name: string; points: number }> = [];

  // Get user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakCurrent: true,
      streakLongest: true,
      totalPoints: true,
    },
  });

  if (!user) return newlyEarned;

  // Get activity counts
  const activityCounts = await prisma.extractedActivity.groupBy({
    by: ["activityType"],
    where: { userId },
    _sum: { quantity: true },
  });

  const activityMap = new Map(
    activityCounts.map((ac) => [ac.activityType, Number(ac._sum.quantity) || 0])
  );

  // Get goal counts
  const completedGoals = await prisma.goal.count({
    where: {
      userGoalSet: { userId },
      validationStatus: "valid",
    },
  });

  const goalSetsCreated = await prisma.userGoalSet.count({
    where: { userId },
  });

  // Get unearned achievements
  const earnedIds = (
    await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    })
  ).map((ua) => ua.achievementId);

  const unearnedAchievements = await prisma.achievement.findMany({
    where: {
      isActive: true,
      id: { notIn: earnedIds },
    },
  });

  // Check each achievement
  for (const achievement of unearnedAchievements) {
    const criteria = JSON.parse(achievement.criteria);
    let earned = false;

    switch (criteria.type) {
      case "streak":
        earned = user.streakCurrent >= criteria.days || user.streakLongest >= criteria.days;
        break;
      case "goals_completed":
        earned = completedGoals >= criteria.count;
        break;
      case "goal_sets_created":
        earned = goalSetsCreated >= criteria.count;
        break;
      case "activity":
        const count = activityMap.get(criteria.activityType) || 0;
        earned = count >= criteria.count;
        break;
    }

    if (earned) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award points
      await prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: achievement.points } },
      });

      newlyEarned.push({
        id: achievement.id,
        name: achievement.name,
        points: achievement.points,
      });
    }
  }

  return newlyEarned;
}
