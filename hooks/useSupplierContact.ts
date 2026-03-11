import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export type SupplierContactPayload = {
  supplierUID: string;
  subject: string;
  message: string;
};

export function useSupplierContact(options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: SupplierContactPayload) => {
      const res = await api.post("/supplier-contact", payload);
      return res.data;
    },
    onSuccess,
    onError,
  });
}
