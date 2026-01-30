import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

const createGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetDate: z.string().optional().transform((s) => (s ? new Date(s) : null)),
  status: z.enum(["active", "completed", "paused", "draft"]).optional().default("draft"),
});

/**
 * GET /api/goals - Get user's standalone goals
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const includeReviews = searchParams.get("includeReviews") === "true";

    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        expertReviews: includeReviews,
        goalUpdates: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            expertReviews: true,
            goalUpdates: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    return handleApiError(error, "goals:GET");
  }
}

/**
 * POST /api/goals - Create a new standalone goal
 */
export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: validated.title,
        description: validated.description,
        targetDate: validated.targetDate,
        status: validated.status,
        validationStatus: "pending",
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return handleApiError(error, "goals:POST");
  }
}
