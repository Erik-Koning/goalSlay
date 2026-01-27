import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, Role } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

const createGuideSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  guideType: z.enum(["role_guide", "goal_guide"]),
  content: z.string(), // JSON string
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  appliesToUserId: z.string().optional(),
});

/**
 * GET /api/admin/guides - Get all guides (admin only)
 */
export async function GET() {
  const authResult = await requireAuth({ permissions: { role: Role.ADMIN } });
  if (!authResult.success) return authResult.response;

  try {
    const guides = await prisma.goalGuide.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        appliesTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ guides });
  } catch (error) {
    return handleApiError(error, "admin/guides:GET");
  }
}

/**
 * POST /api/admin/guides - Create a new guide (admin only)
 */
export async function POST(request: Request) {
  const authResult = await requireAuth({ permissions: { role: Role.ADMIN } });
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createGuideSchema.parse(body);

    const guide = await prisma.goalGuide.create({
      data: {
        ...validated,
        createdById: user.id,
      },
    });

    return NextResponse.json(guide, { status: 201 });
  } catch (error) {
    return handleApiError(error, "admin/guides:POST");
  }
}
