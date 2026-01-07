import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const approveSchema = z.object({
  goalSetId: z.string(),
  action: z.enum(["approve", "reject", "request_changes"]),
  comment: z.string().optional(),
});

/**
 * POST /api/admin/approve - Approve or reject a goal set (admin only)
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = approveSchema.parse(body);

    const goalSet = await prisma.userGoalSet.findUnique({
      where: { id: validated.goalSetId },
    });

    if (!goalSet) {
      return NextResponse.json({ error: "Goal set not found" }, { status: 404 });
    }

    if (goalSet.status !== "pending_approval") {
      return NextResponse.json(
        { error: "Goal set is not pending approval" },
        { status: 400 }
      );
    }

    let newStatus: string;
    switch (validated.action) {
      case "approve":
        newStatus = "active";
        break;
      case "reject":
        newStatus = "abandoned";
        break;
      case "request_changes":
        newStatus = "draft";
        break;
    }

    const updatedGoalSet = await prisma.userGoalSet.update({
      where: { id: validated.goalSetId },
      data: {
        status: newStatus,
        approvedById: validated.action === "approve" ? session.user.id : null,
        approvedAt: validated.action === "approve" ? new Date() : null,
        adminComment: validated.comment,
      },
    });

    return NextResponse.json(updatedGoalSet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error approving goal set:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/approve - Get pending approvals (admin only)
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pendingGoalSets = await prisma.userGoalSet.findMany({
      where: { status: "pending_approval" },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        goals: {
          orderBy: { goalOrder: "asc" },
          include: {
            expertReviews: true,
            progressEstimates: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ pendingGoalSets });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
