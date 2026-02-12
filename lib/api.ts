import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Frontend API client – talks to Next.js route handlers under /api
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Skip auth-clear for login/register so failed login doesn't redirect
const AUTH_ENDPOINTS = ["/auth-login", "/register"];

// Don't treat as global auth failure: 401/500 here should not log the user out (e.g. select-store can 401 when re-calling while navigating)
const NO_LOGOUT_ON_AUTH_FAIL = ["/select-store"];

function isTokenExpired(error: any): boolean {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const bodyStatus = data?.statusCode;
  const message = (data?.message ?? error?.message ?? "")
    .toString()
    .toLowerCase();

  // Only log out if we're certain the token has expired
  // Check for explicit token expiration messages
  const tokenExpiredKeywords =
    /token.*expired|expired.*token|token.*invalid|invalid.*token|token.*expir|session.*expired|expired.*session/;

  // 401 with explicit token expiration message
  if (status === 401 && tokenExpiredKeywords.test(message)) {
    return true;
  }

  // 500 with explicit token expiration message
  if (
    (status === 500 || bodyStatus === 500) &&
    tokenExpiredKeywords.test(message)
  ) {
    return true;
  }

  return false;
}

function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().logout();
  window.location.href = "/";
}

const retryAfterStoreTokenClear = new WeakMap<any, boolean>();

// Attach auth headers (dual token logic) and API key
// These headers will be forwarded by the /api route handlers to the backend.
api.interceptors.request.use((config) => {
  const { accessToken, storeAccessToken } = useAuthStore.getState();
  const url = config.url ?? "";

  // Endpoints that should use the store token when available (flat /api paths)
  const useStoreToken =
    url.includes("/suppliers-list") ||
    url.includes("/supplier-basic-infos") ||
    url.includes("/suppliers") ||
    url.includes("/suppliers-products") ||
    url.includes("/suppliers-display") ||
    url.includes("/orders-get-list") ||
    url.includes("/orders") ||
    url.includes("/order-add") ||
    url.includes("/store-users") ||
    url.includes("/store-pref-schedule") ||
    url.includes("/basket-items") ||
    url.includes("/basket-counter") ||
    url.includes("/basket-suggest-qty") ||
    url.includes("/basket-add-or-update") ||
    url.includes("/basket-remove-item") ||
    url.includes("/wishlist-items") ||
    url.includes("/wishlist-toggle") ||
    url.includes("/my-profile");

  // If we're retrying after clearing store token, use accessToken only
  const isRetry = retryAfterStoreTokenClear.get(config);
  const token =
    useStoreToken && !isRetry ? storeAccessToken || accessToken : accessToken;

  // Ensure config.headers is always present (basic object, Axios can handle it)
  config.headers = config.headers || {};

  (config.headers as any)["X-EORDERAPIKEY"] = "e2026order-pro";

  // Add Authorization header if token exists
  if (token) {
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// Treat body statusCode !== 200 as error (API returns HTTP 200 with statusCode/message in body)
const SUCCESS_STATUS = 200;

api.interceptors.response.use(
  (response) => {
    const data: any = response?.data;
    if (
      data &&
      typeof data.statusCode === "number" &&
      data.statusCode !== SUCCESS_STATUS
    ) {
      const message =
        typeof data.message === "string" && data.message.trim().length > 0
          ? data.message
          : "An unexpected error occurred.";
      const error = new Error(message);
      (error as any).response = response;
      throw error;
    }
    return response;
  },
  async (error) => {
    const url = error?.config?.url ?? "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => url.includes(p));
    const skipLogout = NO_LOGOUT_ON_AUTH_FAIL.some((p) => url.includes(p));

    // Check if this is a 500 error on a store-token endpoint and we haven't retried yet
    const status = error?.response?.status;
    const { storeAccessToken, accessToken } = useAuthStore.getState();
    const isStoreTokenEndpoint =
      url.includes("/suppliers-list") ||
      url.includes("/suppliers") ||
      url.includes("/basket") ||
      url.includes("/orders");

    // If we get a 500 on a store token endpoint and we have a store token,
    // it might be expired. Clear it and retry with accessToken.
    if (
      status === 500 &&
      isStoreTokenEndpoint &&
      storeAccessToken &&
      accessToken &&
      !retryAfterStoreTokenClear.get(error.config)
    ) {
      // Mark that we're retrying
      retryAfterStoreTokenClear.set(error.config, true);
      // Clear the store token
      useAuthStore.getState().setStoreAccessToken(null);
      // Retry the request
      return api.request(error.config);
    }

    // Only log out if token is explicitly expired, not on general API failures
    if (!isAuthEndpoint && !skipLogout && isTokenExpired(error)) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  },
);
