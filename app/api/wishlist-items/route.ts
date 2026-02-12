import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const params: Record<string, string> = {};
    
    // Extract SupplierUID if provided
    const supplierUID = searchParams.get("SupplierUID");
    if (supplierUID) {
      params.SupplierUID = supplierUID;
    }
    
    // Include any other query parameters
    searchParams.forEach((value, key) => {
      if (key !== "SupplierUID") {
        params[key] = value;
      }
    });

    const res = await backend.get("Basket/Wishlist_GetItems", {
      headers: getBackendHeaders(req),
      params,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/wishlist-items:", message);
    return NextResponse.json(
      { message: "Failed to load wishlist items" },
      { status: 500 },
    );
  }
}
