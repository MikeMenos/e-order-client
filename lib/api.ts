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

function isAuthFailure(error: any): boolean {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const bodyStatus = data?.statusCode;
  const message = (data?.message ?? error?.message ?? "")
    .toString()
    .toLowerCase();
  const hadAuthHeader = !!(error?.config?.headers as any)?.["Authorization"];

  if (status === 401) return true;
  if (status === 500 || bodyStatus === 500) {
    const authKeywords =
      /token|expired|unauthorized|authorization|invalid.*session|session.*invalid|not.*logged|login.*required/;
    if (authKeywords.test(message)) return true;
    // Any 500 on an authenticated request may be expired/invalid token (e.g. after long idle)
    if (hadAuthHeader) return true;
  }
  return false;
}

function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().logout();
  window.location.href = "/";
}

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
    url.includes("/my-profile");

  const token = useStoreToken ? storeAccessToken || accessToken : accessToken;

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
  (error) => {
    const url = error?.config?.url ?? "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => url.includes(p));

    if (!isAuthEndpoint && isAuthFailure(error)) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  },
);
