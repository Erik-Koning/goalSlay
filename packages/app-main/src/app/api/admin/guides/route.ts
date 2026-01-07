import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

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
    console.error("Error fetching guides:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/guides - Create a new guide (admin only)
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
    const validated = createGuideSchema.parse(body);

    const guide = await prisma.goalGuide.create({
      data: {
        ...validated,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(guide, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating guide:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
