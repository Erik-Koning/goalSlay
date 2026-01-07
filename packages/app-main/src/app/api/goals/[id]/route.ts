import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "ABANDONED"];

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  specific: z.string().min(1).optional(),
  measurable: z.string().min(1).optional(),
  achievable: z.string().min(1).optional(),
  relevant: z.string().min(1).optional(),
  timeBound: z.string().datetime().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "ABANDONED"]).optional(),
  currentValue: z.number().min(0).optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().optional(),
  category: z.string().nullable().optional(),
  priority: z.number().min(1).max(3).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id] - Get a single goal by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        progressLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/goals/[id] - Update a goal
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateGoalSchema.parse(body);

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.specific !== undefined) updateData.specific = validated.specific;
    if (validated.measurable !== undefined) updateData.measurable = validated.measurable;
    if (validated.achievable !== undefined) updateData.achievable = validated.achievable;
    if (validated.relevant !== undefined) updateData.relevant = validated.relevant;
    if (validated.timeBound !== undefined) updateData.timeBound = new Date(validated.timeBound);
    if (validated.status !== undefined) {
      updateData.status = validated.status;
      // Set completedAt when marking as completed
      if (validated.status === "COMPLETED" && existingGoal.status !== "COMPLETED") {
        updateData.completedAt = new Date();
      } else if (validated.status !== "COMPLETED") {
        updateData.completedAt = null;
      }
    }
    if (validated.currentValue !== undefined) updateData.currentValue = validated.currentValue;
    if (validated.targetValue !== undefined) updateData.targetValue = validated.targetValue;
    if (validated.unit !== undefined) updateData.unit = validated.unit;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.priority !== undefined) updateData.priority = validated.priority;

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        progressLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[id] - Delete a goal
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
