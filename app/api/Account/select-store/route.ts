import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/backend";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? undefined;
    const apiKey = req.headers.get("x-eorderapikey") ?? "key1";

    const url = new URL(req.url);
    const storeUID = url.searchParams.get("StoreUID");

    const res = await backend.get("Account/User_SelectStore", {
      params: { StoreUID: storeUID ?? undefined },
      headers: {
        Authorization: authHeader,
        "X-EORDERAPIKEY": apiKey,
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error(
      "Error in /api/account/select-store:",
      error?.message ?? error,
    );
    return NextResponse.json(
      { message: "Failed to select store" },
      { status: 500 },
    );
  }
}
