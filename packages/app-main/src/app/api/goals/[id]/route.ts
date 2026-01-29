import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError, commonErrors } from "@/lib/api-error";

const updateGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  targetDate: z.string().optional().nullable().transform((s) => (s ? new Date(s) : null)),
  status: z.enum(["active", "completed", "paused", "draft"]).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/goals/[id] - Get a single goal with all details
 */
export async function GET(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        expertReviews: {
          orderBy: { createdAt: "desc" },
        },
        goalUpdates: {
          orderBy: { createdAt: "desc" },
        },
        progressEstimates: true,
      },
    });

    if (!goal) {
      return commonErrors.notFound("Goal");
    }

    return NextResponse.json(goal);
  } catch (error) {
    return handleApiError(error, "goals:GET:id");
  }
}

/**
 * PATCH /api/goals/[id] - Update a goal
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateGoalSchema.parse(body);

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingGoal) {
      return commonErrors.notFound("Goal");
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description && { description: validated.description }),
        ...(validated.targetDate !== undefined && { targetDate: validated.targetDate }),
        ...(validated.status && { status: validated.status }),
      },
      include: {
        expertReviews: true,
        _count: {
          select: {
            goalUpdates: true,
          },
        },
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    return handleApiError(error, "goals:PATCH");
  }
}

/**
 * DELETE /api/goals/[id] - Delete a goal
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingGoal) {
      return commonErrors.notFound("Goal");
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "goals:DELETE");
  }
}
