import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export type WishlistSortPayload = {
  supplierUID?: string;
  sortedProducts: Array<{ productUID: string; newRank: number }>;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WishlistSortPayload;
    const { supplierUID, sortedProducts } = body;
    const payload: Record<string, unknown> = { sortedProducts };
    if (supplierUID) payload.SupplierUID = supplierUID;
    const res = await backend.post("Basket/Wishlist_SortProducts", payload, {
      headers: getBackendHeaders(req),
    });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/wishlist-sort:", message);
    return NextResponse.json(
      { message: "Failed to sort wishlist" },
      { status: 500 },
    );
  }
}
