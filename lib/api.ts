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

// Attach auth headers (dual token logic) and API key
// These headers will be forwarded by the /api route handlers to the backend.
api.interceptors.request.use((config) => {
  const { accessToken, storeAccessToken } = useAuthStore.getState();
  const url = config.url ?? "";

  // Endpoints that should use the store token when available (flat /api paths)
  const useStoreToken =
    url.includes("/suppliers-list") ||
    url.includes("/suppliers") ||
    url.includes("/suppliers-products") ||
    url.includes("/suppliers-display") ||
    url.includes("/orders") ||
    url.includes("/store-users") ||
    url.includes("/store-pref-schedule") ||
    url.includes("/basket-items") ||
    url.includes("/basket-counter") ||
    url.includes("/wishlist-items");

  const token = useStoreToken ? storeAccessToken || accessToken : accessToken;

  // Ensure config.headers is always present (basic object, Axios can handle it)
  config.headers = config.headers || {};

  (config.headers as any)["X-EORDERAPIKEY"] = "key1";

  // Add Authorization header if token exists
  if (token) {
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const data: any = response?.data;
    if (
      data &&
      typeof data.statusCode === "number" &&
      data.statusCode === 500
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
    return Promise.reject(error);
  },
);
