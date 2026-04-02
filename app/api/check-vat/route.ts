import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vat = String(body?.vat ?? "")
      .replace(/\s/g, "")
      .trim();
    const postalCode = String(body?.postalCode ?? "")
      .replace(/\s/g, "")
      .trim();
    const res = await backend.post(
      "Account/User_CheckVat",
      { vat, postalCode },
      {
        headers: {
          ...getBackendHeaders(req, { includeAuth: false }),
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.data != null) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/check-vat:", message);
    return NextResponse.json(
      { message: "VAT lookup failed" },
      { status: 500 },
    );
  }
}
