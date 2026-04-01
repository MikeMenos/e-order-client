import type { RegisterResponse } from "../hooks/useRegister";

export const REGISTER_VERIFY_STORAGE_KEY = "register_verify_appUserUID";

/** extraActions when email + SMS verification is required after registration */
export function matchesVerifyEmailMobileExtraActions(
  extraActions?: string | null,
): boolean {
  if (extraActions == null || !String(extraActions).trim()) return false;
  const parts = String(extraActions)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .sort();
  const target = ["verify_email", "verify_mobile"].sort();
  return (
    parts.length === 2 && parts[0] === target[0] && parts[1] === target[1]
  );
}

export function shouldPromptRegisterVerification(
  data: RegisterResponse,
): boolean {
  const uid = data.appUserUID;
  if (typeof uid !== "string" || !uid.trim()) return false;
  return matchesVerifyEmailMobileExtraActions(data.extraActions);
}
