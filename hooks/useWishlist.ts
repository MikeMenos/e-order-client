import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/** Backend response: wishLists array, each with supplierUID and items */
export type WishlistBackendResponse = {
  wishLists?: Array<{
    supplierUID?: string;
    supplierTitle?: string;
    supplierSubtitle?: string;
    supplierLogo?: string;
    items?: Array<Record<string, unknown>>;
  }>;
  statusCode?: number;
  message?: string;
};

function mapWishlistResponse(
  data: WishlistBackendResponse | undefined,
  supplierUID?: string,
): {
  items: Array<Record<string, unknown>>;
  wishLists?: WishlistBackendResponse["wishLists"];
} {
  const wishLists = data?.wishLists ?? [];
  if (supplierUID) {
    const match = wishLists.find(
      (w) => (w.supplierUID ?? "").toLowerCase() === supplierUID.toLowerCase(),
    );
    return { items: match?.items ?? [], wishLists };
  }
  const items = wishLists.flatMap((w) =>
    (w.items ?? []).map((item: Record<string, unknown>) => ({
      ...item,
      supplierTitle: w.supplierTitle,
      title: item.productTitle ?? item.title,
    })),
  );
  return { items, wishLists };
}

export const useWishlistItems = () => {
  return useQuery({
    queryKey: ["wishlist-items"],
    queryFn: async () => {
      const res = await api.get<WishlistBackendResponse>("/wishlist-items", {
        params: {},
      });
      return mapWishlistResponse(res.data);
    },
  });
};

export const useWishlistItemsBySupplier = (supplierUID: string | undefined) => {
  return useQuery({
    queryKey: ["wishlist-items", supplierUID],
    queryFn: async () => {
      const res = await api.get<WishlistBackendResponse>("/wishlist-items", {
        params: supplierUID ? { SupplierUID: supplierUID } : {},
      });
      return mapWishlistResponse(res.data, supplierUID ?? undefined);
    },
    enabled: !!supplierUID,
  });
};
