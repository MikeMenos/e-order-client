import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function GET(req: NextRequest) {
  try {
    const res = await backend.get("Shop/SuppliersNoPartners_GetList", {
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/suppliers-no-partners:", message);
    return NextResponse.json(
      { message: "Failed to load suppliers" },
      { status: 500 },
    );
  }
}
