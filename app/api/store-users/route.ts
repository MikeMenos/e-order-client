import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const apiKey = req.headers.get("x-eorderapikey") ?? "key1";
    const url = new URL(req.url);
    const storeUID = url.searchParams.get("StoreUID") ?? undefined;

    const res = await backend.post("MyStore/Users_Get", null, {
      headers: {
        Authorization: authHeader,
        "X-EORDERAPIKEY": apiKey,
      },
      params: { StoreUID: storeUID },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/store-users:", message);
    return NextResponse.json(
      { message: "Failed to load store users" },
      { status: 500 },
    );
  }
}
