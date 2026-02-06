import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderUID = searchParams.get("OrderUID");
    if (!orderUID) {
      return NextResponse.json(
        { message: "OrderUID is required" },
        { status: 400 },
      );
    }
    const res = await backend.get("Orders/Order_View", {
      params: { OrderUID: orderUID },
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/orders-view:", message);
    return NextResponse.json(
      { message: "Failed to load order details" },
      { status: 500 },
    );
  }
}
