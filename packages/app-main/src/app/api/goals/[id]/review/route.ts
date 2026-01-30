import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { handleApiError, commonErrors } from "@/lib/api-error";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/goals/[id]/review - Submit goal to Expert Council for review
 */
export async function POST(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth({ rateLimit: "expensive_llm" });
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const { id } = await params;

    // Get the goal
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goal) {
      return commonErrors.notFound("Goal");
    }

    // Forward to Python backend for Expert Council review
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/goals/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal_id: goal.id,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate?.toISOString() || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      return NextResponse.json(
        { message: error.detail || "Failed to get expert review", error: "EXTERNAL_SERVICE_ERROR" },
        { status: response.status }
      );
    }

    const reviewData = await response.json();

    // Store expert reviews in database
    const expertReviews = await Promise.all(
      reviewData.experts.map(async (expert: {
        expert_type: string;
        expert_name: string;
        score: number;
        feedback: string;
        suggestions: string[];
      }) => {
        return prisma.expertReview.create({
          data: {
            goalId: goal.id,
            expertId: expert.expert_type,
            expertName: expert.expert_name,
            reviewContent: expert.feedback,
            score: expert.score,
            feedback: expert.feedback,
            suggestions: JSON.stringify(expert.suggestions),
            actionItems: JSON.stringify(expert.suggestions),
          },
        });
      })
    );

    // Update goal with council score and summary
    await prisma.goal.update({
      where: { id: goal.id },
      data: {
        councilScore: reviewData.overall_score,
        expertSummary: reviewData.summary,
        councilReviewedAt: new Date(),
        validationStatus: reviewData.overall_score >= 7 ? "valid" : "warning",
      },
    });

    return NextResponse.json({
      goal_id: goal.id,
      overall_score: reviewData.overall_score,
      summary: reviewData.summary,
      experts: reviewData.experts,
      reviewed_at: reviewData.reviewed_at,
      stored_reviews: expertReviews.length,
    });
  } catch (error) {
    return handleApiError(error, "goals:review:POST");
  }
}
