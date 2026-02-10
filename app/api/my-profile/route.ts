import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

/**
 * GET Account/MyProfile
 */
export async function GET(req: NextRequest) {
  try {
    const res = await backend.get("Account/MyProfile", {
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/my-profile:", message);
    return NextResponse.json(
      { message: "Failed to load profile" },
      { status: 500 },
    );
  }
}

