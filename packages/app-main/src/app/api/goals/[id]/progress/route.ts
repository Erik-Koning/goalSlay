import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const logProgressSchema = z.object({
  value: z.number().min(0, "Value must be non-negative"),
  note: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/goals/[id]/progress - Log progress for a goal
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: goalId } = await params;

    // Verify ownership and get current value
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = logProgressSchema.parse(body);

    // Create progress log
    await prisma.progressLog.create({
      data: {
        goalId,
        userId: session.user.id,
        value: validated.value,
        previousValue: existingGoal.currentValue,
        note: validated.note,
        source: "manual",
      },
    });

    // Determine new status based on progress
    let newStatus = existingGoal.status;
    let completedAt = existingGoal.completedAt;

    if (validated.value >= existingGoal.targetValue) {
      newStatus = "COMPLETED";
      completedAt = new Date();
    } else if (validated.value > 0 && existingGoal.status === "NOT_STARTED") {
      newStatus = "IN_PROGRESS";
    }

    // Update goal with new progress
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: validated.value,
        status: newStatus,
        completedAt,
      },
      include: {
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        progressLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // Check and update milestones
    if (updatedGoal.milestones.length > 0) {
      const milestonesToComplete = updatedGoal.milestones.filter(
        (m) => !m.completed && validated.value >= m.targetValue
      );

      if (milestonesToComplete.length > 0) {
        await prisma.milestone.updateMany({
          where: {
            id: { in: milestonesToComplete.map((m) => m.id) },
          },
          data: {
            completed: true,
            completedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error logging progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/goals/[id]/progress - Get progress history for a goal
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: goalId } = await params;

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: { goalId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(progressLogs);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
