/**
 * Extracts a user-facing error message from an API/axios error.
 * Prefers the backend message (response.data.message), then Error.message, then fallback.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })
    ?.response?.data;
  const msg = typeof data?.message === "string" ? data.message : null;
  if (msg != null && msg.trim().length > 0) return msg;
  const errMsg = err instanceof Error ? err.message : null;
  if (errMsg != null && errMsg.trim().length > 0) return errMsg;
  return fallback;
}
