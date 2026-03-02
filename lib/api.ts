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

/**
 * Logout only when: /api/select-store with StoreUID returns 401 Unauthorized.
 * All other auth failures do not trigger automatic logout.
 */
function shouldLogoutOnError(error: any): boolean {
  const status = error?.response?.status;
  const url = error?.config?.url ?? "";
  const params = error?.config?.params ?? {};
  const hasStoreUID =
    url.includes("StoreUID=") ||
    (typeof params?.StoreUID === "string" && params.StoreUID.length > 0);

  return (
    status === 401 &&
    (url.includes("select-store") || url.includes("/select-store")) &&
    hasStoreUID
  );
}

function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().logout();
  window.location.href = "/";
}

// Attach auth headers (dual token logic) and API key
// All endpoints use store token when available, otherwise fall back to main access token.
api.interceptors.request.use((config) => {
  const { accessToken, storeAccessToken } = useAuthStore.getState();
  const token = storeAccessToken || accessToken;

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
    if (shouldLogoutOnError(error)) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  },
);
