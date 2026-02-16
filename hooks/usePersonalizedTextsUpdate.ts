import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type PersonalizedTextsUpdatePayload = {
  productUID: string | null;
  supplierUID: string | null;
  erpCatUID: string | null;
  displayText: string;
  displayText2: string;
  displayText3: string;
  personalNotes: string;
  /** Omit when updating supplier customTitle (displayText) only */
  remove?: boolean;
};

export type PersonalizedTextsUpdateResponse = {
  statusCode: number;
  message: string;
  detailedMessage: string;
};

export function usePersonalizedTextsUpdate(options?: {
  productUID?: string;
  supplierUID?: string;
  onSuccess?: (data: PersonalizedTextsUpdateResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { productUID, supplierUID, onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: PersonalizedTextsUpdatePayload) => {
      const res = await api.post<PersonalizedTextsUpdateResponse>(
        "/personalized-texts-update",
        payload,
      );
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
      if (productUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["product-display", productUID],
        });
      }
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["supplier-products", supplierUID],
        });
      }
    },
    onError,
  });
}
