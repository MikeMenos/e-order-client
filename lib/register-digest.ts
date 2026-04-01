import { createHash } from "crypto";

/** Shared secret for User_Register digest (server-side only). */
export const REGISTER_DIGEST_HASH_KEY = "e2024pro#";

/**
 * UTC time token: yyyy-M-d-H-m (month/day/hour/minute without leading zeros).
 */
export function utcRegisterTimeToken(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const H = date.getUTCHours();
  const m = date.getUTCMinutes();
  return `${y}-${M}-${d}-${H}-${m}`;
}

/**
 * Digest = SHA1(Hashkey + "|" + timetoken + "|" + username + "|" + email)
 * username/email are the account fields sent in the registration request.
 */
export function registerRequestDigest(params: {
  timeToken: string;
  accountUsername: string;
  accountEmail: string;
}): string {
  const { timeToken, accountUsername, accountEmail } = params;
  const s = `${REGISTER_DIGEST_HASH_KEY}|${timeToken}|${accountUsername}|${accountEmail}`;
  return createHash("sha1").update(s, "utf8").digest("hex");
}
