import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { backend } from "../../../lib/backend";
import { getBackendHeaders } from "../../../lib/backend-headers";
import {
  registerRequestDigest,
  utcRegisterTimeToken,
} from "../../../lib/register-digest";

/** Node runtime required for `crypto.createHash` in register digest. */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const body =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const accountUsername = String(body.accountUsername ?? "").trim();
    const accountEmail = String(body.accountEmail ?? "").trim();
    const vat = String(body.vat ?? "")
      .replace(/\s/g, "")
      .trim();
    const postalCode = String(body.postalCode ?? "")
      .replace(/\s/g, "")
      .trim();

    const timeToken = utcRegisterTimeToken();
    const digest = registerRequestDigest({
      timeToken,
      accountUsername,
      accountEmail,
    });

    const rest: Record<string, unknown> = { ...body };
    delete rest.timeToken;
    delete rest.digest;

    const payload = {
      ...rest,
      vat,
      postalCode,
      timeToken,
      digest,
    };

    const res = await backend.post("Account/User_Register", payload, {
      headers: {
        ...getBackendHeaders(req, { includeAuth: false }),
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.data != null) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/register:", message);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
