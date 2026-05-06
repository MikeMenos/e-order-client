import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

/**
 * POST Account/DeleteMyAccount
 */
export async function POST(req: NextRequest) {
  try {
    const res = await backend.post("Account/DeleteMyAccount", null, {
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/delete-my-account:", message);
    return NextResponse.json(
      { message: "Failed to delete account" },
      { status: 500 },
    );
  }
}
