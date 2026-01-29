import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

/**
 * GET /api/export/user - Export user's own data as JSON
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        timezone: true,
        streakCurrent: true,
        streakLongest: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    const goalSets = await prisma.userGoalSet.findMany({
      where: { userId: user.id },
      include: {
        goals: {
          include: {
            progressEstimates: true,
            expertReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const dailyUpdates = await prisma.dailyUpdate.findMany({
      where: { userId: user.id },
      include: {
        extractedActivities: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const achievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        achievement: true,
      },
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userData,
      goalSets,
      dailyUpdates,
      achievements,
      summary: {
        totalGoalSets: goalSets.length,
        totalGoals: goalSets.reduce((acc, gs) => acc + gs.goals.length, 0),
        totalUpdates: dailyUpdates.length,
        totalActivities: dailyUpdates.reduce(
          (acc, u) => acc + u.extractedActivities.length,
          0
        ),
        achievementsEarned: achievements.length,
      },
    };

    if (format === "csv") {
      // Generate CSV for goals
      const csvRows = [
        [
          "Goal Set ID",
          "Goal Order",
          "Goal Text",
          "Status",
          "Start Date",
          "Created At",
        ],
      ];

      for (const goalSet of goalSets) {
        for (const goal of goalSet.goals) {
          csvRows.push([
            goalSet.id,
            (goal.goalOrder ?? 0).toString(),
            `"${(goal.goalText ?? goal.description ?? "").replace(/"/g, '""')}"`,
            goal.validationStatus,
            goalSet.startDate.toISOString().split("T")[0],
            goalSet.createdAt.toISOString(),
          ]);
        }
      }

      const csv = csvRows.map((row) => row.join(",")).join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="chat-assistant-export-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (error) {
    return handleApiError(error, "export/user:GET");
  }
}
