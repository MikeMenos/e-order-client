import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await backend.post("Account/Register", body, {
      headers: { ...getBackendHeaders(req, { includeAuth: false }), "Content-Type": "application/json" },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/register:", message);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
