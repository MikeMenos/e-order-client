import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { OrderAddPayload, OrderAddResponse } from "../lib/types/order";

export type { OrderAddPayload, OrderAddResponse } from "../lib/types/order";

export function useOrderAdd(options?: {
  onSuccess?: (data: OrderAddResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async (payload: OrderAddPayload) => {
      const res = await api.post<OrderAddResponse>("/order-add", payload);
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications-count-unread"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["notifications-get-items"],
      });
      onSuccess?.(data);
    },
    onError,
  });
}
