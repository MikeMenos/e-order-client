import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await backend.post("Orders/Orders_GetList", body, {
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/orders-get-list:", message);
    return NextResponse.json(
      { message: "Failed to load orders list" },
      { status: 500 },
    );
  }
}
