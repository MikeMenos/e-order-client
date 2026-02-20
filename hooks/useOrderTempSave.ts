import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  OrderTempSavePayload,
  OrderTempSaveResponse,
} from "../lib/types/order";

export type {
  OrderTempSavePayload,
  OrderTempSaveResponse,
} from "../lib/types/order";

export function useOrderTempSave(options?: {
  onSuccess?: (data: OrderTempSaveResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async (payload: OrderTempSavePayload) => {
      const res = await api.post<OrderTempSaveResponse>(
        "/order-temp-save",
        payload,
      );
      return res.data;
    },
    onSuccess,
    onError,
  });
}
