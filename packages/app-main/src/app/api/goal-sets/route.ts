import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

const createGoalSetSchema = z.object({
  goals: z
    .array(
      z.object({
        goalText: z.string().min(10, "Goal must be at least 10 characters"),
        goalOrder: z.number().min(1).max(5),
      })
    )
    .min(3, "Must have at least 3 goals")
    .max(5, "Cannot have more than 5 goals"),
  startDate: z.string().transform((s) => new Date(s)),
});

/**
 * GET /api/goal-sets - Get user's goal sets
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const goalSets = await prisma.userGoalSet.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        goals: {
          orderBy: { goalOrder: "asc" },
          include: {
            progressEstimates: true,
            expertReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ goalSets });
  } catch (error) {
    return handleApiError(error, "goal-sets:GET");
  }
}

/**
 * POST /api/goal-sets - Create a new goal set
 */
export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createGoalSetSchema.parse(body);

    // Calculate editable window (14 days from start)
    const editableUntil = new Date(validated.startDate);
    editableUntil.setDate(editableUntil.getDate() + 14);

    const goalSet = await prisma.userGoalSet.create({
      data: {
        userId: user.id,
        status: "draft",
        startDate: validated.startDate,
        editableUntil,
        goals: {
          create: validated.goals.map((goal) => ({
            goalText: goal.goalText,
            goalOrder: goal.goalOrder,
            validationStatus: "pending",
          })),
        },
      },
      include: {
        goals: {
          orderBy: { goalOrder: "asc" },
        },
      },
    });

    return NextResponse.json(goalSet, { status: 201 });
  } catch (error) {
    return handleApiError(error, "goal-sets:POST");
  }
}
