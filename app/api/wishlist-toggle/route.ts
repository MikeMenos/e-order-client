import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";
import { isApiSuccess } from "../../../lib/api-response";
import type { WishlistToggleResponse } from "../../../lib/types/wishlist";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productUID = url.searchParams.get("ProductUID");

    const res = await backend.get<WishlistToggleResponse>(
      "Basket/Wishlist_ToggleItem",
      {
        params: { ProductUID: productUID ?? undefined },
        headers: getBackendHeaders(req),
      },
    );

    const data = res.data as Record<string, unknown>;
    // Normalize backend success (statusCode 0) so client interceptor accepts it
    const body =
      data && isApiSuccess(data) && data.statusCode === 0
        ? { ...data, statusCode: 200 }
        : data;

    return NextResponse.json(body, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/wishlist-toggle:", message);
    return NextResponse.json(
      { message: "Failed to toggle wishlist item" },
      { status: 500 },
    );
  }
}
