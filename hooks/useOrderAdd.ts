import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { OrderAddPayload, OrderAddResponse } from "../lib/types/order";

export type { OrderAddPayload, OrderAddResponse } from "../lib/types/order";

export function useOrderAdd(options?: {
  onSuccess?: (data: OrderAddResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async (payload: OrderAddPayload) => {
      const res = await api.post<OrderAddResponse>("/order-add", payload);
      return res.data;
    },
    onSuccess,
    onError,
  });
}
