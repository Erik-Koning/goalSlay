import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { reviewGoalSet } from "@/lib/agents";
import type { ExpertId } from "@/lib/agents";

const reviewSchema = z.object({
  goalSetId: z.string(),
  goals: z.array(
    z.object({
      goalId: z.string(),
      goalText: z.string(),
      goalOrder: z.number().min(1).max(5),
      selectedExperts: z.array(z.string()),
    })
  ),
});

/**
 * POST /api/goals/experts/review - Trigger expert review for a goal set
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Verify goal set ownership
    const goalSet = await prisma.userGoalSet.findFirst({
      where: {
        id: validated.goalSetId,
        userId: session.user.id,
      },
      include: {
        goals: true,
      },
    });

    if (!goalSet) {
      return NextResponse.json({ error: "Goal set not found" }, { status: 404 });
    }

    // Run expert review
    const reviewResult = await reviewGoalSet({
      goalSetId: validated.goalSetId,
      userId: session.user.id,
      goals: validated.goals.map((g) => ({
        goalId: g.goalId,
        goalText: g.goalText,
        goalOrder: g.goalOrder,
        selectedExperts: g.selectedExperts as ExpertId[],
      })),
    });

    // Save results to database
    for (const goalResult of reviewResult.goals) {
      // Update goal validation status
      await prisma.goal.update({
        where: { id: goalResult.goalId },
        data: {
          validationStatus: goalResult.validationStatus,
          validationFeedback: goalResult.validationFeedback,
          expertSummary: goalResult.expertSummary,
        },
      });

      // Save expert reviews
      for (const review of goalResult.expertReviews) {
        await prisma.expertReview.create({
          data: {
            goalId: goalResult.goalId,
            expertId: review.expertId,
            expertName: review.expertName,
            reviewContent: review.reviewContent,
            actionItems: review.actionItems ? JSON.stringify(review.actionItems) : null,
          },
        });
      }

      // Save progress estimate if present
      if (goalResult.progressEstimate) {
        await prisma.goalProgressEstimate.create({
          data: {
            goalId: goalResult.goalId,
            unit: goalResult.progressEstimate.unit,
            estimatedPerDay: goalResult.progressEstimate.estimatedPerDay,
            estimatedPerWeek: goalResult.progressEstimate.estimatedPerWeek,
            setBy: "expert",
          },
        });
      }

      // Save expert selections
      const goal = validated.goals.find((g) => g.goalId === goalResult.goalId);
      if (goal) {
        for (const expertId of goal.selectedExperts) {
          await prisma.goalExpertSelection.upsert({
            where: {
              goalId_expertId: {
                goalId: goalResult.goalId,
                expertId,
              },
            },
            update: {},
            create: {
              goalId: goalResult.goalId,
              expertId,
              isRequired: expertId === "progress_tracker",
            },
          });
        }
      }
    }

    // Update goal set status
    await prisma.userGoalSet.update({
      where: { id: validated.goalSetId },
      data: {
        status: "pending_review",
      },
    });

    return NextResponse.json(reviewResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error running expert review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
