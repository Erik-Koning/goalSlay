import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EXPERTS, ExpertId } from "@/lib/agents";

/**
 * GET /api/goals/experts - Get available experts
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return experts as array with required flag
    const experts = Object.values(EXPERTS).map((expert) => ({
      id: expert.id,
      name: expert.name,
      description: expert.description,
      icon: expert.icon,
      isRequired: expert.isRequired,
    }));

    return NextResponse.json({ experts });
  } catch (error) {
    console.error("Error fetching experts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
