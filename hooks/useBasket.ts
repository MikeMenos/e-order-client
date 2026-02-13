import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  BasketItemsData,
  BasketAddOrUpdatePayload,
} from "../lib/types/basket";

export type { BasketItemsData, BasketAddOrUpdatePayload } from "../lib/types/basket";

export const useBasketItems = (params?: {
  SupplierUID?: string;
  enabled?: boolean;
}) => {
  const { SupplierUID, enabled = true } = params ?? {};
  return useQuery({
    queryKey: ["basket-items", SupplierUID],
    queryFn: async () => {
      const res = await api.get<BasketItemsData>("/basket-items", {
        params: SupplierUID != null ? { SupplierUID } : {},
      });
      return res.data;
    },
    enabled: enabled !== false,
  });
};

export const useBasketRemoveItem = (options?: {
  supplierUID?: string;
  onSuccess?: (data: { message?: string }) => void;
  onError?: (err: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { supplierUID, onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async (basketUID: string) => {
      const res = await api.post<{ message?: string }>("/basket-remove-item", {
        basketUID,
      });
      return res.data;
    },
    onSuccess: (data, _basketUID) => {
      onSuccess?.(data);
      if (supplierUID != null) {
        void queryClient.refetchQueries({
          queryKey: ["basket-items", supplierUID],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["basket-counter"] });
    },
    onError,
  });
};

export const useBasketAddOrUpdate = (options?: {
  supplierUID?: string;
  onSuccess?: (data: { message?: string }) => void;
  onError?: (err: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  const { supplierUID, onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async (payload: BasketAddOrUpdatePayload) => {
      const res = await api.post<{ message?: string }>(
        "/basket-add-or-update",
        payload,
      );
      return res.data;
    },
    onSuccess: (data, _payload) => {
      onSuccess?.(data);
      if (supplierUID != null) {
        void queryClient.refetchQueries({
          queryKey: ["basket-items", supplierUID],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["basket-counter"] });
    },
    onError,
  });
};

export const useBasketCounter = () => {
  return useQuery({
    queryKey: ["basket-counter"],
    queryFn: async () => {
      const res = await api.get("/basket-counter", {
        params: {},
      });
      return res.data;
    },
  });
};
