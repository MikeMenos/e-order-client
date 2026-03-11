import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

/**
 * POST supplier contact (send message to supplier)
 * Body: { supplierUID: string; subject: string; message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierUID, subject, message } = body;
    if (supplierUID == null) {
      return NextResponse.json(
        { message: "supplierUID is required" },
        { status: 400 },
      );
    }
    const res = await backend.post(
      "Shop/Supplier_Contact",
      { supplierUID, subject: subject ?? "", message: message ?? "" },
      { headers: getBackendHeaders(req) },
    );
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/supplier-contact:", message);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 },
    );
  }
}
