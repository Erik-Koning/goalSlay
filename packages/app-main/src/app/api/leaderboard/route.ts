import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

/**
 * GET /api/leaderboard - Get leaderboard data
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "points"; // points, streak, achievements
    const limit = parseInt(searchParams.get("limit") || "10");

    let leaderboard;

    switch (type) {
      case "streak":
        leaderboard = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            image: true,
            streakCurrent: true,
            streakLongest: true,
          },
          orderBy: { streakCurrent: "desc" },
          take: limit,
        });
        break;

      case "achievements":
        const achievementCounts = await prisma.userAchievement.groupBy({
          by: ["userId"],
          _count: { achievementId: true },
          orderBy: { _count: { achievementId: "desc" } },
          take: limit,
        });

        const achievementUserIds = achievementCounts.map((ac) => ac.userId);
        const achievementUsers = await prisma.user.findMany({
          where: { id: { in: achievementUserIds } },
          select: { id: true, name: true, image: true },
        });

        const achievementUserMap = new Map(
          achievementUsers.map((u) => [u.id, u])
        );

        leaderboard = achievementCounts.map((ac) => ({
          ...achievementUserMap.get(ac.userId),
          achievementCount: ac._count.achievementId,
        }));
        break;

      case "points":
      default:
        leaderboard = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            image: true,
            totalPoints: true,
            streakCurrent: true,
          },
          orderBy: { totalPoints: "desc" },
          take: limit,
        });
        break;
    }

    // Get current user's rank
    const currentUserRank = await getUserRank(user.id, type);

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      type,
    });
  } catch (error) {
    return handleApiError(error, "leaderboard:GET");
  }
}

async function getUserRank(userId: string, type: string): Promise<number> {
  switch (type) {
    case "streak": {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streakCurrent: true },
      });
      if (!user) return 0;

      const rank = await prisma.user.count({
        where: { streakCurrent: { gt: user.streakCurrent } },
      });
      return rank + 1;
    }

    case "achievements": {
      const userCount = await prisma.userAchievement.count({
        where: { userId },
      });

      const higherCounts = await prisma.userAchievement.groupBy({
        by: ["userId"],
        _count: { achievementId: true },
        having: {
          achievementId: { _count: { gt: userCount } },
        },
      });

      return higherCounts.length + 1;
    }

    case "points":
    default: {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      if (!user) return 0;

      const rank = await prisma.user.count({
        where: { totalPoints: { gt: user.totalPoints } },
      });
      return rank + 1;
    }
  }
}
