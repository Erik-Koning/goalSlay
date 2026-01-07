import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { validateGoal } from "@/lib/agents";

const validateSchema = z.object({
  goalText: z.string().min(10, "Goal must be at least 10 characters"),
});

/**
 * POST /api/goals/validate - Validate a single goal using LLM
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = validateSchema.parse(body);

    const result = await validateGoal({
      goalId: "temp-validation",
      goalText: validated.goalText,
    });

    return NextResponse.json({
      status: result.status,
      feedback: result.feedback,
      isValid: result.status === "valid",
      needsRevision: result.status === "rejected",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error validating goal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
