import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, Role } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

/**
 * GET /api/export/team - Export team data as JSON or CSV (admin only)
 */
export async function GET(request: Request) {
  const authResult = await requireAuth({ permissions: { role: Role.ADMIN } });
  if (!authResult.success) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {};

    // Get team stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        streakCurrent: true,
        streakLongest: true,
        totalPoints: true,
        createdAt: true,
        _count: {
          select: {
            goalSets: true,
            dailyUpdates: true,
            userAchievements: true,
          },
        },
      },
      orderBy: { totalPoints: "desc" },
    });

    // Get activity summary
    const activitySummary = await prisma.extractedActivity.groupBy({
      by: ["activityType"],
      _sum: { quantity: true },
      _count: true,
      where: dateFilter,
    });

    // Get goal completion stats
    const goalStats = await prisma.goal.groupBy({
      by: ["validationStatus"],
      _count: true,
    });

    // Get daily update stats by period
    const updateStats = await prisma.dailyUpdate.groupBy({
      by: ["updatePeriod"],
      _count: true,
      where: dateFilter,
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange: { startDate, endDate },
      teamSummary: {
        totalUsers: users.length,
        totalPoints: users.reduce((acc, u) => acc + u.totalPoints, 0),
        avgStreak:
          users.reduce((acc, u) => acc + u.streakCurrent, 0) / users.length,
        totalGoalSets: users.reduce((acc, u) => acc + u._count.goalSets, 0),
        totalUpdates: users.reduce((acc, u) => acc + u._count.dailyUpdates, 0),
        totalAchievements: users.reduce(
          (acc, u) => acc + u._count.userAchievements,
          0
        ),
      },
      users,
      activitySummary,
      goalStats,
      updateStats,
    };

    if (format === "csv") {
      // Generate CSV for users
      const csvRows = [
        [
          "Name",
          "Email",
          "Role",
          "Current Streak",
          "Longest Streak",
          "Total Points",
          "Goal Sets",
          "Daily Updates",
          "Achievements",
        ],
      ];

      for (const user of users) {
        csvRows.push([
          `"${user.name?.replace(/"/g, '""') || ""}"`,
          user.email,
          user.role,
          user.streakCurrent.toString(),
          user.streakLongest.toString(),
          user.totalPoints.toString(),
          user._count.goalSets.toString(),
          user._count.dailyUpdates.toString(),
          user._count.userAchievements.toString(),
        ]);
      }

      const csv = csvRows.map((row) => row.join(",")).join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="chat-assistant-team-export-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (error) {
    return handleApiError(error, "export/team:GET");
  }
}
