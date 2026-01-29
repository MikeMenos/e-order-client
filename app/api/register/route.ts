import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = req.headers.get("x-eorderapikey") ?? "key1";

    const res = await backend.post("Account/Register", body, {
      headers: {
        "Content-Type": "application/json",
        "X-EORDERAPIKEY": apiKey,
      },
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
