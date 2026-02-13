import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export type OrderRetakePayload = {
  orderRefDate: string;
  orderUID: string;
  updateMode: 0 | 1;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderRetakePayload;
    const { orderRefDate, orderUID, updateMode = 0 } = body;
    if (!orderUID || !orderRefDate) {
      return NextResponse.json(
        { message: "orderUID and orderRefDate are required" },
        { status: 400 },
      );
    }
    const res = await backend.post(
      "Orders/Order_Retake",
      { orderRefDate, orderUID, updateMode },
      { headers: getBackendHeaders(req) },
    );
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/order-retake:", message);
    return NextResponse.json(
      { message: "Failed to redo order" },
      { status: 500 },
    );
  }
}
