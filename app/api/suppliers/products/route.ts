import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../../lib/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const authHeader = req.headers.get("authorization") ?? undefined;
    const apiKey = req.headers.get("x-eorderapikey") ?? "key1";

    const res = await backend.post("Shop/Supplier_GetProducts", body, {
      headers: {
        Authorization: authHeader,
        "X-EORDERAPIKEY": apiKey,
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error("Error in /api/suppliers/products:", error?.message ?? error);
    return NextResponse.json(
      { message: "Failed to load supplier products" },
      { status: 500 },
    );
  }
}
