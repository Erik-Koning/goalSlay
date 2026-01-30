import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

const updateSettingsSchema = z.object({
  progressReminderEnabled: z.boolean().optional(),
  progressThresholdPercent: z.number().min(0).max(100).optional(),
  dailyReminderEnabled: z.boolean().optional(),
  dailyReminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  weeklySummaryEnabled: z.boolean().optional(),
});

/**
 * GET /api/notifications/settings - Get notification settings
 */
export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error, "notifications/settings:GET");
  }
}

/**
 * PUT /api/notifications/settings - Update notification settings
 */
export async function PUT(request: Request) {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = updateSettingsSchema.parse(body);

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: validated,
      create: {
        userId: user.id,
        ...validated,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error, "notifications/settings:PUT");
  }
}
