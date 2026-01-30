import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, Role } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

/**
 * GET /api/admin/users - Get all users (admin only)
 */
export async function GET(request: Request) {
  const authResult = await requireAuth({ permissions: { role: Role.ADMIN } });
  if (!authResult.success) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          streakCurrent: true,
          streakLongest: true,
          totalPoints: true,
          createdAt: true,
          _count: {
            select: {
              goalSets: true,
              dailyUpdates: true,
              userAchievements: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "admin/users:GET");
  }
}
