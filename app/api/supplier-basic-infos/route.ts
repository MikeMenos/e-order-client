import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

/**
 * GET Shop/Supplier_BasicInfos
 * Query: SupplierUID (optional - if backend returns one supplier by UID)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierUID = searchParams.get("SupplierUID");
    const params = supplierUID ? { SupplierUID: supplierUID } : {};
    const res = await backend.get("Shop/Supplier_BasicInfos", {
      params,
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/supplier-basic-infos:", message);
    return NextResponse.json(
      { message: "Failed to load supplier info" },
      { status: 500 },
    );
  }
}
