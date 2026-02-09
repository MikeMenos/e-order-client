import { NextResponse } from "next/server";
import iconv from "iconv-lite";

/**
* Decodes arraybuffer response from e-order backend and parses JSON (win1253).
* Used by get-client-data and other ergastirio API routes.
 */
export async function decodeBackendResponse(response: {
  data: ArrayBuffer;
}): Promise<NextResponse> {
  try {
    const text = iconv.decode(Buffer.from(response.data), "win1253").trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Empty response from backend", errorcode: -1 },
        { status: 200 }
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: text,
          errorcode: -1,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        errorcode: -1,
      },
      { status: 500 }
    );
  }
}
