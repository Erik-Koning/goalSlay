import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retainSafeKeys } from "@/lib/utils";

/**
 * API Route to fetch users with only safe columns returned.
 * Safe columns are specified by an array of keys.
 */
export async function GET() {
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
