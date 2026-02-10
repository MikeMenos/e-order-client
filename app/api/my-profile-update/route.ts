import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

/**
 * POST Account/MyProfile_Update
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await backend.post("Account/MyProfile_Update", body, {
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/my-profile-update:", message);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}

