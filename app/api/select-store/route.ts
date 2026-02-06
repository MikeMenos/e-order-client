import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const storeUID = url.searchParams.get("StoreUID");

    const res = await backend.get("Account/User_SelectStore", {
      params: { StoreUID: storeUID ?? undefined },
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/select-store:", message);
    return NextResponse.json(
      { message: "Failed to select store" },
      { status: 500 },
    );
  }
}
