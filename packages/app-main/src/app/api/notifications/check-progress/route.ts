import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, apiError, ErrorCode } from "@/lib/api-error";

/**
 * POST /api/notifications/check-progress - Cron job to check progress and send notifications
 * This should be called by a cron job (e.g., Azure Functions, Vercel Cron)
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return apiError("Invalid cron authorization", ErrorCode.UNAUTHORIZED, 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get users with notifications enabled who haven't updated today
    const usersToNotify = await prisma.user.findMany({
      where: {
        notificationSettings: {
          dailyReminderEnabled: true,
        },
        dailyUpdates: {
          none: {
            periodDate: {
              gte: today,
            },
          },
        },
      },
      include: {
        notificationSettings: true,
        goalSets: {
          where: { status: "active" },
          take: 1,
        },
      },
    });

    const notifications: Array<{
      userId: string;
      email: string;
      type: string;
      message: string;
    }> = [];

    for (const user of usersToNotify) {
      if (user.goalSets.length > 0) {
        notifications.push({
          userId: user.id,
          email: user.email,
          type: "daily_reminder",
          message: `Don't forget to log your progress today! Your ${user.streakCurrent}-day streak is at stake.`,
        });
      }
    }

    // Check for users below progress threshold
    const activeGoalSets = await prisma.userGoalSet.findMany({
      where: { status: "active" },
      include: {
        user: {
          include: {
            notificationSettings: true,
          },
        },
        goals: {
          include: {
            progressEstimates: true,
            linkedActivities: true,
          },
        },
      },
    });

    for (const goalSet of activeGoalSets) {
      if (!goalSet.user.notificationSettings?.progressReminderEnabled) continue;

      const threshold = goalSet.user.notificationSettings.progressThresholdPercent;

      for (const goal of goalSet.goals) {
        const estimate = goal.progressEstimates[0];
        if (!estimate) continue;

        // Calculate expected vs actual progress
        const daysSinceStart = Math.floor(
          (today.getTime() - goalSet.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const expectedProgress = daysSinceStart * Number(estimate.estimatedPerDay);

        const actualProgress = goal.linkedActivities.reduce(
          (acc, a) => acc + Number(a.quantity),
          0
        );

        const progressPercent =
          expectedProgress > 0 ? (actualProgress / expectedProgress) * 100 : 100;

        if (progressPercent < threshold) {
          notifications.push({
            userId: goalSet.user.id,
            email: goalSet.user.email,
            type: "progress_warning",
            message: `You're at ${Math.round(progressPercent)}% of expected progress for "${(goal.goalText ?? goal.title ?? "your goal").slice(0, 50)}..."`,
          });
        }
      }
    }

    // In a real implementation, this would send emails via Azure Communication Services
    // For now, just return the notifications that would be sent
    console.log(`Would send ${notifications.length} notifications`);

    return NextResponse.json({
      success: true,
      notificationsQueued: notifications.length,
      notifications: process.env.NODE_ENV === "development" ? notifications : undefined,
    });
  } catch (error) {
    return handleApiError(error, "notifications/check-progress:POST");
  }
}
