import { NextResponse } from "next/server";
import { backendErgastirio } from "@/lib/backend-ergastirio";
import { decodeBackendResponse } from "@/lib/api-utils";

const LOCATEINFO =
  "SALDOC:TRDR,SERIES,PAYMENT,SUMAMNT ;ITELINES:LINENUM,MTRL,MTRL_ITEM_CODE,MTRL_ITEM_NAME,QTY2,LINEVAL,SXPERC";

export async function POST(req: Request) {
  try {
    const { KEY } = await req.json();
    const clientID = process.env.CLIENT_ID;
    const appId = process.env.APP_ID;
    const response = await backendErgastirio.post(
      "/s1services",
      {
        service: "getData",
        clientID,
        appId,
        OBJECT: "SALDOC",
        KEY,
        LOCATEINFO,
      },
      { responseType: "arraybuffer" }
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
      { status: 500 }
    );
  }
}
