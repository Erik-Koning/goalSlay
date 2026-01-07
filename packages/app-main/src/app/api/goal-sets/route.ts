import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const goalSets = await prisma.userGoalSet.findMany({
      where: {
        userId: session.user.id,
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
    console.error("Error fetching goal sets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goal-sets - Create a new goal set
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createGoalSetSchema.parse(body);

    // Calculate editable window (14 days from start)
    const editableUntil = new Date(validated.startDate);
    editableUntil.setDate(editableUntil.getDate() + 14);

    const goalSet = await prisma.userGoalSet.create({
      data: {
        userId: session.user.id,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating goal set:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
