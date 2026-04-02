import type { RegisterResponse } from "../hooks/useRegister";

/** Session key for registration flow → /register/verify (User_VerifyAccount uses registrationUID). */
export const REGISTER_VERIFY_STORAGE_KEY = "register_verify_registrationUID";

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

/**
 * Id for User_VerifyAccount: prefer registrationUID from User_Register, then legacy appUserUID.
 */
export function getRegisterVerificationUid(
  data: RegisterResponse & Record<string, unknown>,
): string | null {
  const record =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : {};
  const raw =
    record.registrationUID ??
    record.RegistrationUID ??
    record.appUserUID ??
    record.AppUserUID;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s.length > 0 ? s : null;
}

/**
 * After registration, continue to email/SMS verification when User_Register returns a verification id.
 */
export function shouldPromptRegisterVerification(
  data: RegisterResponse & Record<string, unknown>,
): boolean {
  return getRegisterVerificationUid(data) != null;
}
