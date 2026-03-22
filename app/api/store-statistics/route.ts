import { NextRequest, NextResponse } from "next/server";
import { backend } from "@/lib/backend";
import { getBackendHeaders } from "@/lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const payload = { stats_display: body.stats_display };
    const res = await backend.post("MyStore/StoreStatistics_Get", payload, {
      headers: getBackendHeaders(req),
    });
    const data = res.data as Record<string, unknown>;
    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/store-statistics:", message);
    return NextResponse.json(
      { message: "Failed to load store statistics" },
      { status: 500 },
    );
  }
}
