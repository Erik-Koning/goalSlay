import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "api:GET");
  }
}
