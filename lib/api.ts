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

  // Endpoints that should use the store token when available
  const useStoreToken =
    url.includes("Shop/Suppliers_GetList") ||
    url.includes("Shop/Supplier_GetProducts") ||
    url.includes("Shop/Supplier_Display") ||
    url.includes("Shop/Supplier_BasicInfos") ||
    url.includes("Orders/Orders_GetList") ||
    url.includes("MyStore/Users_Get") ||
    url.includes("MyStore/Users_ViewProfile") ||
    url.includes("Basket/Wishlist_GetItems") ||
    url.includes("Basket/Wishlist_ToggleItem") ||
    url.includes("Basket/Basket_AddOrUpdate") ||
    url.includes("Basket/Basket_SuggestQty") ||
    url.includes("Basket/Basket_RemoveItem") ||
    url.includes("Basket/Basket_GetItems") ||
    url.includes("Orders/Order_Add") ||
    url.includes("MyStore/PersonalizedTexts_Update") ||
    url.includes("Account/MyProfile") ||
    url.includes("Basket/Basket_GetCounter") ||
    url.includes("Basket/Basket_Delete") ||
    url.includes("Basket/Wishlist_SortProduct") ||
    url.includes("Shop/Product_Display") ||
    url.includes("MyStore/PrefSchedule_Get") ||
    url.includes("MyStore/PrefSchedule_Update") ||
    url.includes("Orders/Order_View") ||
    url.includes("Orders/Order_Retake");

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
