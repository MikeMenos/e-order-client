import { NextResponse } from "next/server";
import { backendErgastirio } from "@/lib/backend-ergastirio";
import { decodeBackendResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const clientID = process.env.CLIENT_ID;
    if (!clientID) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Server misconfiguration: CLIENT_ID is not set. Add CLIENT_ID to your deployment environment variables (e.g. Vercel → Project Settings → Environment Variables).",
          errorcode: -1,
        },
        { status: 500 },
      );
    }

    const body = await req.json();
    const AFM = body?.AFM ?? "";
    const PIN = body?.PIN ?? "";

    const response = await backendErgastirio.post(
      "/s1services/js/api.web/PELATES_BY_PASS",
      { AFM, PIN, clientID },
      { responseType: "arraybuffer" },
    );

    return decodeBackendResponse(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        errorcode: -1,
      },
      { status: 500 },
    );
  }
}
