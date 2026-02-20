import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { isApiSuccess, getApiResponseMessage } from "./api-response";

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
// order-temp-save, product-display, personalized-texts-update: show error to user instead of logging out so they can retry or fix
const NO_LOGOUT_ON_AUTH_FAIL = [
  "/select-store",
  "order-temp-save",
  "product-display",
  "personalized-texts-update",
];

function isAuthFailure(error: any): boolean {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const bodyStatus = data?.statusCode;
  const message = (data?.message ?? error?.message ?? "")
    .toString()
    .toLowerCase();
  const hadAuthHeader = !!(error?.config?.headers as any)?.["Authorization"];

  // Any 401 is an auth failure (e.g. expired or invalid token)
  if (status === 401) return true;

  // 500 with auth-related message, or any 500 on an authenticated request (likely expired/invalid token)
  if (status === 500 || bodyStatus === 500) {
    const authKeywords =
      /token|expired|unauthorized|authorization|invalid.*session|session.*invalid|not.*logged|login.*required/;
    if (authKeywords.test(message)) return true;
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
    url.includes("/suppliers-no-partners") ||
    url.includes("/supplier-basic-infos") ||
    url.includes("/suppliers") ||
    url.includes("/suppliers-products") ||
    url.includes("/suppliers-display") ||
    url.includes("/orders-get-list") ||
    url.includes("/orders") ||
    url.includes("/order-add") ||
    url.includes("/order-temp-save") ||
    url.includes("/order-retake") ||
    url.includes("/store-users") ||
    url.includes("/users-view-profile") ||
    url.includes("/users-toggle-active") ||
    url.includes("/users-add-or-update") ||
    url.includes("/users-set-permissions") ||
    url.includes("/store-pref-schedule") ||
    url.includes("/store-pref-schedule-update") ||
    url.includes("/basket-items") ||
    url.includes("/basket-counter") ||
    url.includes("/basket-suggest-qty") ||
    url.includes("/basket-add-or-update") ||
    url.includes("/basket-remove-item") ||
    url.includes("/wishlist-items") ||
    url.includes("/wishlist-toggle") ||
    url.includes("/wishlist-sort") ||
    url.includes("/my-profile") ||
    url.includes("/product-display") ||
    url.includes("/personalized-texts-update");

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

// Treat body statusCode as error when not success (API returns HTTP 200 with statusCode/message in body)
api.interceptors.response.use(
  (response) => {
    const data: any = response?.data;
    if (data && typeof data.statusCode === "number" && !isApiSuccess(data)) {
      const message =
        getApiResponseMessage(data) || "An unexpected error occurred.";
      const error = new Error(message);
      (error as any).response = response;
      (error as any).config = response?.config;
      throw error;
    }
    return response;
  },
  async (error) => {
    const url = error?.config?.url ?? "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => url.includes(p));
    const skipLogout = NO_LOGOUT_ON_AUTH_FAIL.some((p) => url.includes(p));

    if (!isAuthEndpoint && !skipLogout && isAuthFailure(error)) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  },
);
