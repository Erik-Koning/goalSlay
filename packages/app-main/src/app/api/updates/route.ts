import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError, commonErrors } from "@/lib/api-error";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

const createUpdateSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  rawText: z.string().min(5, "Update must be at least 5 characters"),
});

/**
 * GET /api/updates - Get user's goal updates
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    const updates = await prisma.goalUpdate.findMany({
      where: {
        userId: user.id,
        ...(goalId && { goalId }),
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ updates });
  } catch (error) {
    return handleApiError(error, "updates:GET");
  }
}

/**
 * POST /api/updates - Submit a new goal update with LLM parsing
 */
export async function POST(request: Request) {
  const authResult = await requireAuth({ rateLimit: "standard_llm" });
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createUpdateSchema.parse(body);

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: {
        id: validated.goalId,
        userId: user.id,
      },
    });

    if (!goal) {
      return commonErrors.notFound("Goal");
    }

    // Forward to Python backend for parsing
    const parseResponse = await fetch(`${PYTHON_BACKEND_URL}/api/v1/updates/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal_id: validated.goalId,
        raw_text: validated.rawText,
      }),
    });

    let parsedData = null;
    let sentiment = null;
    let momentumScore = null;

    if (parseResponse.ok) {
      const parsed = await parseResponse.json();
      parsedData = JSON.stringify({
        activities: parsed.activities,
        summary: parsed.summary,
      });
      sentiment = parsed.sentiment;
      momentumScore = parsed.momentum_score;
    }

    // Store the update
    const update = await prisma.goalUpdate.create({
      data: {
        goalId: validated.goalId,
        userId: user.id,
        rawText: validated.rawText,
        parsedData,
        sentiment,
        momentumScore,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      update,
      parsed: parsedData ? JSON.parse(parsedData) : null,
      sentiment,
      momentumScore,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "updates:POST");
  }
}
