/**
 * Cookie utilities for storing and retrieving authentication data
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Set a cookie with standard settings
 */
export function setCookie(name: string, value: string | null): void {
  if (typeof document === "undefined") return;

  if (value === null) {
    // Delete cookie
    document.cookie = `${name}=; path=/; max-age=0; sameSite=lax`;
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${COOKIE_MAX_AGE}; sameSite=lax`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (!cookieValue) return null;
    try {
      return decodeURIComponent(cookieValue);
    } catch {
      // Malformed %-encoding (e.g. corrupted or single %) can throw URIError
      return null;
    }
  }

  return null;
}

/**
 * Initialize auth state from cookies on app load
 * This should be called early in the app lifecycle, before any API calls
 * Updates zustand store directly to avoid triggering cookie setters
 * Wrapped in try/catch so a failure never crashes the app (e.g. on Android after redirect).
 */
export function initAuthFromCookies(): void {
  if (typeof window === "undefined") return;

  try {
    // Use dynamic import to avoid circular dependencies
    const { useAuthStore } = require("../stores/auth");
    const accessToken = getCookie("accessToken");
    const storeAccessToken = getCookie("storeAccessToken");
    const selectedStoreUID = getCookie("selectedStoreUID");

    const currentState = useAuthStore.getState();

    if (accessToken && accessToken !== currentState.accessToken) {
      useAuthStore.setState({ accessToken });
    }
    if (storeAccessToken && storeAccessToken !== currentState.storeAccessToken) {
      useAuthStore.setState({ storeAccessToken });
    }
    if (selectedStoreUID && selectedStoreUID !== currentState.selectedStoreUID) {
      useAuthStore.setState({ selectedStoreUID });
    }
  } catch (_) {
    // Do not crash the app; auth will fall back to store/redirect flow
  }
}
