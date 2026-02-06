import { NextRequest } from "next/server";

const DEFAULT_API_KEY = "e2026order-pro";

export type BackendHeadersOptions = {
  /** Include Authorization header from request. Default true. Set false for unauthenticated endpoints (e.g. register). */
  includeAuth?: boolean;
};

/**
 * Builds headers for backend (e-order API) requests from a Next.js route request.
 * Use in API route handlers that proxy to the backend.
 */
export function getBackendHeaders(
  req: NextRequest,
  options: BackendHeadersOptions = {},
): Record<string, string> {
  const { includeAuth = true } = options;
  const headers: Record<string, string> = {
    "X-EORDERAPIKEY": req.headers.get("x-eorderapikey") ?? DEFAULT_API_KEY,
  };
  if (includeAuth) {
    const auth = req.headers.get("authorization") ?? undefined;
    if (auth) headers["Authorization"] = auth;
  }
  return headers;
}
