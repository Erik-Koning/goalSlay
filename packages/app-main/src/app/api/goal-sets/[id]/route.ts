import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError, apiError, ErrorCode } from "@/lib/api-error";

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
  status: z
    .enum([
      "draft",
      "pending_review",
      "pending_approval",
      "active",
      "completed",
      "abandoned",
    ])
    .optional(),
});

/**
 * GET /api/goal-sets/[id] - Get a specific goal set
 */
export async function GET(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;

    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id,
        userId: user.id,
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
      return apiError("Goal set not found", ErrorCode.NOT_FOUND, 404);
    }

    return NextResponse.json(goalSet);
  } catch (error) {
    return handleApiError(error, "goal-sets/[id]:GET");
  }
}

/**
 * PUT /api/goal-sets/[id] - Update a goal set
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;

    // Check ownership and editable status
    const existingGoalSet = await prisma.userGoalSet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingGoalSet) {
      return apiError("Goal set not found", ErrorCode.NOT_FOUND, 404);
    }

    // Check if still in editable window
    if (
      existingGoalSet.editableUntil &&
      new Date() > existingGoalSet.editableUntil
    ) {
      return apiError(
        "Goal set is no longer editable",
        ErrorCode.FORBIDDEN,
        403,
        { editableUntil: existingGoalSet.editableUntil }
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
          title: goal.goalText.substring(0, 255), // Use goalText as title
          description: goal.goalText, // Use goalText as description
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
    return handleApiError(error, "goal-sets/[id]:PUT");
  }
}

/**
 * DELETE /api/goal-sets/[id] - Delete a goal set
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;

    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goalSet) {
      return apiError("Goal set not found", ErrorCode.NOT_FOUND, 404);
    }

    // Only allow deletion of draft goal sets
    if (goalSet.status !== "draft") {
      return apiError(
        "Can only delete draft goal sets",
        ErrorCode.FORBIDDEN,
        403,
        { currentStatus: goalSet.status }
      );
    }

    await prisma.userGoalSet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "goal-sets/[id]:DELETE");
  }
}
