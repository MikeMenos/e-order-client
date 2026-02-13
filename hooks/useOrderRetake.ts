import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type { OrderRetakePayload } from "../lib/types/order";

/** Convert orderRefDate to ISO string if needed (backend expects e.g. 2026-02-13T09:21:39.617Z) */
function toOrderRefDateISO(value: string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  return new Date(value + "T12:00:00.000Z").toISOString();
}

export function useOrderRetake(options?: {
  supplierUID?: string;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { orderUID: string; orderRefDate: string | null }) => {
      const res = await api.post("/order-retake", {
        orderUID: payload.orderUID,
        orderRefDate: toOrderRefDateISO(payload.orderRefDate),
        updateMode: 0,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-order-history"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
