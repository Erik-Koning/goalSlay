import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retainSafeKeys } from "@/lib/utils";
import { requireAuth } from "@/lib/authorization";
import { handleApiError } from "@/lib/api-error";

/**
 * GET /api/users/getUserSafeColumns - Fetch users with only safe columns
 */
export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.response;

  try {
    const users = await prisma.user.findMany();

    // Define the safe keys to retain
    const safeKeys = [
      "id",
      "name",
      "email",
      "emailVerified",
      "image",
      "role",
      "createdAt",
      "updatedAt",
    ];

    // Strip users objects to only include safe keys
    const safeUsers = retainSafeKeys(users, safeKeys);

    return NextResponse.json(safeUsers);
  } catch (error) {
    return handleApiError(error, "users:GET");
  }
}
