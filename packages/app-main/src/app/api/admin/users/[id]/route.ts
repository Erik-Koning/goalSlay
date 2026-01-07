import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  streakCurrent: z.number().min(0).optional(),
  totalPoints: z.number().min(0).optional(),
});

/**
 * GET /api/admin/users/[id] - Get user details (admin only)
 */
export async function GET(request: Request, { params }: RouteParams) {
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

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        goalSets: {
          orderBy: { createdAt: "desc" },
          include: {
            goals: {
              orderBy: { goalOrder: "asc" },
              include: {
                progressEstimates: true,
              },
            },
          },
        },
        dailyUpdates: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            extractedActivities: true,
          },
        },
        userAchievements: {
          include: {
            achievement: true,
          },
        },
        notificationSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id] - Update user (admin only)
 */
export async function PUT(request: Request, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
