import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const apiKey = req.headers.get("x-eorderapikey") ?? "key1";

    const res = await backend.get("Basket/Basket_GetItems", {
      headers: {
        Authorization: authHeader,
        "X-EORDERAPIKEY": apiKey,
      },
      params: Object.fromEntries(new URL(req.url).searchParams.entries()),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/basket-items:", message);
    return NextResponse.json(
      { message: "Failed to load basket items" },
      { status: 500 },
    );
  }
}
