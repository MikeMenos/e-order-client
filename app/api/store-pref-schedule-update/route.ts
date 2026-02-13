import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";
import type { PrefScheduleUpdatePayload } from "../../../lib/types/schedule";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PrefScheduleUpdatePayload;
    const { supplierUID, dayNum, isMarked } = body;
    if (supplierUID == null || dayNum == null) {
      return NextResponse.json(
        { message: "supplierUID and dayNum are required" },
        { status: 400 },
      );
    }
    const res = await backend.post(
      "MyStore/PrefSchedule_Update",
      { supplierUID, dayNum, isMarked },
      { headers: getBackendHeaders(req) },
    );
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/store-pref-schedule-update:", message);
    return NextResponse.json(
      { message: "Failed to update schedule" },
      { status: 500 },
    );
  }
}
