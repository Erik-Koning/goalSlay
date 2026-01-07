import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalSetId = searchParams.get("goalSetId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const updates = await prisma.dailyUpdate.findMany({
      where: {
        userId: session.user.id,
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
    console.error("Error fetching daily updates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daily-updates - Create a new daily update
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createUpdateSchema.parse(body);

    // Verify goal set ownership
    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id: validated.goalSetId,
        userId: session.user.id,
      },
    });

    if (!goalSet) {
      return NextResponse.json({ error: "Goal set not found" }, { status: 404 });
    }

    // Check for existing update in same period
    const existingUpdate = await prisma.dailyUpdate.findFirst({
      where: {
        userId: session.user.id,
        userGoalSetId: validated.goalSetId,
        updatePeriod: validated.updatePeriod,
        periodDate: validated.periodDate,
      },
    });

    if (existingUpdate) {
      return NextResponse.json(
        { error: "Update already exists for this period" },
        { status: 409 }
      );
    }

    const update = await prisma.dailyUpdate.create({
      data: {
        userId: session.user.id,
        userGoalSetId: validated.goalSetId,
        updateText: validated.updateText,
        updatePeriod: validated.updatePeriod,
        periodDate: validated.periodDate,
      },
    });

    // Update user streak
    await updateStreak(session.user.id);

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating daily update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakCurrent: true, streakLongest: true, streakLastUpdate: true },
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
