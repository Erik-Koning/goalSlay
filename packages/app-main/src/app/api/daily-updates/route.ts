import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError, apiError, ErrorCode } from "@/lib/api-error";

const createUpdateSchema = z.object({
  goalSetId: z.string(),
  updateText: z.string().min(10, "Update must be at least 10 characters"),
  updatePeriod: z.enum(["morning", "afternoon", "evening", "full_day"]),
  periodDate: z.string().transform((s) => new Date(s)),
});

/**
 * GET /api/daily-updates - Get user's daily updates
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const goalSetId = searchParams.get("goalSetId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const updates = await prisma.dailyUpdate.findMany({
      where: {
        userId: user.id,
        ...(goalSetId && { userGoalSetId: goalSetId }),
        ...(startDate &&
          endDate && {
            periodDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        extractedActivities: {
          include: {
            linkedGoal: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ updates });
  } catch (error) {
    return handleApiError(error, "daily-updates:GET");
  }
}

/**
 * POST /api/daily-updates - Create a new daily update
 */
export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createUpdateSchema.parse(body);

    // Verify goal set ownership
    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id: validated.goalSetId,
        userId: user.id,
      },
    });

    if (!goalSet) {
      return apiError("Goal set not found", ErrorCode.NOT_FOUND, 404);
    }

    // Check for existing update in same period
    const existingUpdate = await prisma.dailyUpdate.findFirst({
      where: {
        userId: user.id,
        userGoalSetId: validated.goalSetId,
        updatePeriod: validated.updatePeriod,
        periodDate: validated.periodDate,
      },
    });

    if (existingUpdate) {
      return apiError(
        "Update already exists for this period",
        ErrorCode.VALIDATION_ERROR,
        409,
        { period: validated.updatePeriod, date: validated.periodDate }
      );
    }

    const update = await prisma.dailyUpdate.create({
      data: {
        userId: user.id,
        userGoalSetId: validated.goalSetId,
        updateText: validated.updateText,
        updatePeriod: validated.updatePeriod,
        periodDate: validated.periodDate,
      },
    });

    // Update user streak
    await updateStreak(user.id);

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    return handleApiError(error, "daily-updates:POST");
  }
}

async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakCurrent: true,
      streakLongest: true,
      streakLastUpdate: true,
    },
  });

  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastUpdate = user.streakLastUpdate
    ? new Date(user.streakLastUpdate)
    : null;

  if (lastUpdate) {
    lastUpdate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      const newStreak = user.streakCurrent + 1;
      await prisma.user.update({
        where: { id: userId },
        data: {
          streakCurrent: newStreak,
          streakLongest: Math.max(newStreak, user.streakLongest),
          streakLastUpdate: today,
          totalPoints: { increment: 20 }, // Points for daily update
        },
      });
    } else {
      // Streak broken, reset to 1
      await prisma.user.update({
        where: { id: userId },
        data: {
          streakCurrent: 1,
          streakLastUpdate: today,
          totalPoints: { increment: 20 },
        },
      });
    }
  } else {
    // First update ever
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCurrent: 1,
        streakLastUpdate: today,
        totalPoints: { increment: 20 },
      },
    });
  }
}
