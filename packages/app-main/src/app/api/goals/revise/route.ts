import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

const reviseGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

/**
 * POST /api/goals/revise - Get AI-powered goal revision suggestions
 */
export async function POST(request: Request) {
  const authResult = await requireAuth({ rateLimit: "standard_llm" });
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const validated = reviseGoalSchema.parse(body);

    // Forward to Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/goals/revise`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: validated.title,
        description: validated.description,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      return NextResponse.json(
        { message: error.detail || "Failed to revise goal", error: "EXTERNAL_SERVICE_ERROR" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "goals:revise:POST");
  }
}
