import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { WishlistToggleResponse } from "../lib/types/wishlist";

export type { WishlistToggleResponse } from "../lib/types/wishlist";

export function useWishlistToggle(options?: {
  supplierUID?: string;
  onSuccess?: (data: WishlistToggleResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { supplierUID, onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (
      payload: string | { productUID: string; rank?: number },
    ) => {
      const productUID =
        typeof payload === "string" ? payload : payload.productUID;
      const rank =
        typeof payload === "object" && typeof payload.rank === "number"
          ? payload.rank
          : undefined;
      const params: Record<string, string | number> = { ProductUID: productUID };
      if (rank !== undefined) {
        params.Rank = rank;
      }
      const res = await api.get<WishlistToggleResponse>("/wishlist-toggle", {
        params,
      });
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["supplier-products", supplierUID],
        });
        // Invalidate supplier-specific wishlist items
        void queryClient.invalidateQueries({
          queryKey: ["wishlist-items", supplierUID],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError,
  });
}
