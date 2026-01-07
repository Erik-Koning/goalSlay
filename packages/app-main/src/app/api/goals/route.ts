import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  specific: z.string().min(1, "Specific field is required"),
  measurable: z.string().min(1, "Measurable field is required"),
  achievable: z.string().min(1, "Achievable field is required"),
  relevant: z.string().min(1, "Relevant field is required"),
  timeBound: z.string().datetime({ message: "Valid date required" }),
  targetValue: z.number().positive("Target value must be positive").default(100),
  unit: z.string().default("percent"),
  category: z.string().optional(),
  priority: z.number().min(1).max(3).default(2),
});

/**
 * GET /api/goals - List all goals for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: {
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        progressLogs: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals - Create a new goal
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title: validated.title,
        description: validated.description,
        specific: validated.specific,
        measurable: validated.measurable,
        achievable: validated.achievable,
        relevant: validated.relevant,
        timeBound: new Date(validated.timeBound),
        targetValue: validated.targetValue,
        unit: validated.unit,
        category: validated.category,
        priority: validated.priority,
        status: "NOT_STARTED",
        currentValue: 0,
      },
      include: {
        milestones: true,
        progressLogs: true,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
