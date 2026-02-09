import { NextResponse } from "next/server";
import { backendErgastirio } from "@/lib/backend-ergastirio";
import { decodeBackendResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const AFM = body?.AFM ?? "";
    const PIN = body?.PIN ?? "";

    const clientID = process.env.CLIENT_ID;

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
