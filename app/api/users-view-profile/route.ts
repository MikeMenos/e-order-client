import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

/**
 * GET MyStore/Users_ViewProfile
 * AppUserUID as query param
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const appUserUID = url.searchParams.get("AppUserUID") ?? undefined;

    const res = await backend.get("MyStore/Users_ViewProfile", {
      headers: getBackendHeaders(req),
      params: { AppUserUID: appUserUID },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/users-view-profile:", message);
    return NextResponse.json(
      { message: "Failed to load user profile" },
      { status: 500 },
    );
  }
}
