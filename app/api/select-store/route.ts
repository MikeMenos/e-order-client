import { NextRequest, NextResponse } from "next/server";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const storeUID = url.searchParams.get("StoreUID");

    const res = await backend.get("Account/User_SelectStore", {
      params: { StoreUID: storeUID ?? undefined },
      headers: getBackendHeaders(req),
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data?: unknown };
    };
    const status = axiosError.response?.status ?? 500;
    const body = axiosError.response?.data;
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : error instanceof Error
          ? error.message
          : "Failed to select store";
    console.error("Error in /api/select-store:", message);
    return NextResponse.json(
      body && typeof body === "object" ? body : { message },
      { status },
    );
  }
}
