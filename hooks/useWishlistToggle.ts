import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type WishlistToggleResponse = {
  message?: string;
  isFavorite?: boolean;
  iconColor?: string;
  iconMode?: string;
};

export function useWishlistToggle(options?: {
  supplierUID?: string;
  refDate?: string;
  onSuccess?: (data: WishlistToggleResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { supplierUID, refDate, onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (productUID: string) => {
      const res = await api.get<WishlistToggleResponse>("/wishlist-toggle", {
        params: { ProductUID: productUID },
      });
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["supplier-products", supplierUID, refDate],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError,
  });
}
