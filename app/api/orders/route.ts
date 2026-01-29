import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization") ?? undefined;
    const apiKey = req.headers.get("x-eorderapikey") ?? "key1";

    const res = await backend.post("Shop/Orders", body, {
      headers: {
        Authorization: authHeader,
        "X-EORDERAPIKEY": apiKey,
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/orders:", message);
    return NextResponse.json(
      { message: "Failed to load orders" },
      { status: 500 },
    );
  }
}
