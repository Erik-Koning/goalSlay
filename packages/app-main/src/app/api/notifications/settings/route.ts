import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const updateSettingsSchema = z.object({
  progressReminderEnabled: z.boolean().optional(),
  progressThresholdPercent: z.number().min(0).max(100).optional(),
  dailyReminderEnabled: z.boolean().optional(),
  dailyReminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  weeklySummaryEnabled: z.boolean().optional(),
});

/**
 * GET /api/notifications/settings - Get notification settings
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/settings - Update notification settings
 */
export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSettingsSchema.parse(body);

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: validated,
      create: {
        userId: session.user.id,
        ...validated,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
