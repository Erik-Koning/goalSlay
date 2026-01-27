import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, Role } from "@/lib/authorization";
import { handleApiError, apiError, ErrorCode } from "@/lib/api-error";

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
  const authResult = await requireAuth({ permissions: { role: Role.ADMIN } });
  if (!authResult.success) return authResult.response;

  try {
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
      return apiError("User not found", ErrorCode.NOT_FOUND, 404);
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error, "admin/users/[id]:GET");
  }
}

/**
 * PUT /api/admin/users/[id] - Update user (admin only)
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth({ permissions: { role: Role.ADMIN } });
  if (!authResult.success) return authResult.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error, "admin/users/[id]:PUT");
  }
}
