import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

const DEFAULT_PUSH_ENDPOINT = "Account/Notifications_RegisterDeviceToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint =
      process.env.BACKEND_PUSH_DEVICE_TOKEN_ENDPOINT ?? DEFAULT_PUSH_ENDPOINT;

    const res = await backend.post(endpoint, body, {
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/push-device-token:", message);
    return NextResponse.json(
      { message: "Failed to register push token" },
      { status: 500 },
    );
  }
}
