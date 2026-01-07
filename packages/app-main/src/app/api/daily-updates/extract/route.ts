import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { processDailyUpdate } from "@/lib/agents";

const extractSchema = z.object({
  updateId: z.string(),
});

/**
 * POST /api/daily-updates/extract - Extract activities from a daily update
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = extractSchema.parse(body);

    // Get the update
    const update = await prisma.dailyUpdate.findFirst({
      where: {
        id: validated.updateId,
        userId: session.user.id,
      },
      include: {
        userGoalSet: {
          include: {
            goals: true,
          },
        },
      },
    });

    if (!update) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    // Extract activities using LLM
    const result = await processDailyUpdate(
      {
        updateId: update.id,
        userId: session.user.id,
        goalSetId: update.userGoalSetId,
        updateText: update.updateText,
        updatePeriod: update.updatePeriod as "morning" | "afternoon" | "evening" | "full_day",
        periodDate: update.periodDate,
      },
      update.userGoalSet.goals.map((g) => ({
        id: g.id,
        goalText: g.goalText,
      }))
    );

    // Save extracted activities
    const createdActivities = await Promise.all(
      result.activities.map((activity) =>
        prisma.extractedActivity.create({
          data: {
            dailyUpdateId: update.id,
            userId: session.user.id,
            activityType: activity.activityType,
            quantity: activity.quantity,
            summary: activity.summary,
            activityDate: update.periodDate,
            period: update.updatePeriod,
            linkedGoalId: activity.linkedGoalId,
          },
        })
      )
    );

    return NextResponse.json({
      updateId: update.id,
      activities: createdActivities,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error extracting activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
