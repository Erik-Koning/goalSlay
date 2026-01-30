import { NextResponse } from "next/server";
import { requireAuth, withRateLimitHeaders } from "@/lib/authorization";
import { handleApiError, apiError, ErrorCode } from "@/lib/api-error";
import { z } from "zod";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().optional(),
});

export async function POST(request: Request) {
  const authResult = await requireAuth({ rateLimit: "expensive_llm" });
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    const threadId = `${authResult.user.id}-${validated.conversationId || "default"}`;

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": authResult.user.id,
      },
      body: JSON.stringify({
        message: validated.message,
        thread_id: threadId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[chat] Python backend error:", errorText);
      return apiError(
        "Failed to process chat request",
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        response.status,
        process.env.NODE_ENV === "development" ? { backend: errorText } : undefined
      );
    }

    const data = await response.json();
    return withRateLimitHeaders(NextResponse.json(data), authResult.rateLimitResult);
  } catch (error) {
    return handleApiError(error, "chat:POST");
  }
}
