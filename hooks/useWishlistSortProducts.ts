import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type WishlistSortPayload = {
  supplierUID?: string;
  sortedProducts: Array<{ productUID: string; newRank: number }>;
};

export type WishlistSortResponse = {
  statusCode?: number;
  message?: string;
};

export function useWishlistSortProducts(options?: {
  supplierUID?: string;
  onSuccess?: (data: WishlistSortResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { supplierUID, onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: WishlistSortPayload) => {
      const body = {
        ...payload,
        supplierUID: payload.supplierUID ?? supplierUID ?? undefined,
      };
      const res = await api.post<WishlistSortResponse>("/wishlist-sort", body);
      return res.data;
    },
    onSuccess: (data, _variables) => {
      onSuccess?.(data);
      void queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["wishlist-items", supplierUID],
        });
      }
    },
    onError,
  });
}
