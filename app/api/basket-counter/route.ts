import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function GET(req: NextRequest) {
  try {
    const res = await backend.get("Basket/Basket_GetCounter", {
      headers: getBackendHeaders(req),
      params: Object.fromEntries(new URL(req.url).searchParams.entries()),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/basket-counter:", message);
    return NextResponse.json(
      { message: "Failed to load basket counter" },
      { status: 500 },
    );
  }
}
