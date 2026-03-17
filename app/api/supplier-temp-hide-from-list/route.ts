import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await backend.post("Shop/Supplier_TempHideFromList", body, {
      headers: getBackendHeaders(req),
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/supplier-temp-hide-from-list:", message);
    return NextResponse.json(
      { message: "Failed to hide supplier from list" },
      { status: 500 },
    );
  }
}
