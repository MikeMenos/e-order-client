import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const storeUID = url.searchParams.get("StoreUID") ?? undefined;

    const res = await backend.post("MyStore/Users_Get", null, {
      headers: getBackendHeaders(req),
      params: { StoreUID: storeUID },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/store-users:", message);
    return NextResponse.json(
      { message: "Failed to load store users" },
      { status: 500 },
    );
  }
}
