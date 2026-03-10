import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierUID, isApproved } = body;
    if (supplierUID == null) {
      return NextResponse.json(
        { message: "supplierUID is required" },
        { status: 400 },
      );
    }
    const res = await backend.post(
      "MyStore/PrefCollaboration_Update",
      { supplierUID, isApproved: !!isApproved },
      { headers: getBackendHeaders(req) },
    );
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/pref-collaboration-update:", message);
    return NextResponse.json(
      { message: "Failed to update collaboration" },
      { status: 500 },
    );
  }
}
