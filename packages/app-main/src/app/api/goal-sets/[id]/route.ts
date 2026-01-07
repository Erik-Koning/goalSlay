import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateGoalSetSchema = z.object({
  goals: z
    .array(
      z.object({
        id: z.string().optional(),
        goalText: z.string().min(10),
        goalOrder: z.number().min(1).max(5),
      })
    )
    .min(3)
    .max(5)
    .optional(),
  status: z.enum(["draft", "pending_review", "pending_approval", "active", "completed", "abandoned"]).optional(),
});

/**
 * GET /api/goal-sets/[id] - Get a specific goal set
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        goals: {
          orderBy: { goalOrder: "asc" },
          include: {
            progressEstimates: true,
            expertReviews: true,
            expertSelections: true,
          },
        },
        dailyUpdates: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!goalSet) {
      return NextResponse.json({ error: "Goal set not found" }, { status: 404 });
    }

    return NextResponse.json(goalSet);
  } catch (error) {
    console.error("Error fetching goal set:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/goal-sets/[id] - Update a goal set
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership and editable status
    const existingGoalSet = await prisma.userGoalSet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGoalSet) {
      return NextResponse.json({ error: "Goal set not found" }, { status: 404 });
    }

    // Check if still in editable window
    if (existingGoalSet.editableUntil && new Date() > existingGoalSet.editableUntil) {
      return NextResponse.json(
        { error: "Goal set is no longer editable" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateGoalSetSchema.parse(body);

    // Update goals if provided
    if (validated.goals) {
      // Delete existing goals and recreate
      await prisma.goal.deleteMany({
        where: { userGoalSetId: id },
      });

      await prisma.goal.createMany({
        data: validated.goals.map((goal) => ({
          userGoalSetId: id,
          goalText: goal.goalText,
          goalOrder: goal.goalOrder,
          validationStatus: "pending",
        })),
      });
    }

    // Update status if provided
    if (validated.status) {
      await prisma.userGoalSet.update({
        where: { id },
        data: { status: validated.status },
      });
    }

    // Fetch updated goal set
    const updatedGoalSet = await prisma.userGoalSet.findUnique({
      where: { id },
      include: {
        goals: {
          orderBy: { goalOrder: "asc" },
        },
      },
    });

    return NextResponse.json(updatedGoalSet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating goal set:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goal-sets/[id] - Delete a goal set
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!goalSet) {
      return NextResponse.json({ error: "Goal set not found" }, { status: 404 });
    }

    // Only allow deletion of draft goal sets
    if (goalSet.status !== "draft") {
      return NextResponse.json(
        { error: "Can only delete draft goal sets" },
        { status: 403 }
      );
    }

    await prisma.userGoalSet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal set:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
