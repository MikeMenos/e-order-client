import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationUID =
      searchParams.get("notificationUID") ?? null;
    const res = await backend.post(
      "Account/Notifications_MarkAsRead",
      {},
      {
        headers: getBackendHeaders(req),
        params: { notificationUID },
      },
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/notifications-mark-as-read:", message);
    return NextResponse.json(
      { message: "Failed to mark as read" },
      { status: 500 },
    );
  }
}
