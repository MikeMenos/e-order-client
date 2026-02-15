/**
 * Success status codes returned by the backend in response body (statusCode).
 * Backend may use 0, 200, or 201 for success; others (e.g. 500) indicate error.
 */
export const API_SUCCESS_STATUS_CODES = [0, 200, 201] as const;

export function isApiSuccess(data: { statusCode?: number } | null): boolean {
  if (data == null || typeof data.statusCode !== "number") return true;
  return API_SUCCESS_STATUS_CODES.includes(
    data.statusCode as (typeof API_SUCCESS_STATUS_CODES)[number],
  );
}

/**
 * User-facing message from API error response (message or detailedMessage).
 */
export function getApiResponseMessage(data: {
  message?: string;
  detailedMessage?: string;
} | null): string {
  if (data == null) return "";
  const msg = typeof data.message === "string" ? data.message.trim() : "";
  if (msg.length > 0) return msg;
  const detailed =
    typeof data.detailedMessage === "string"
      ? data.detailedMessage.trim()
      : "";
  if (detailed.length > 0) return detailed;
  return "";
}
