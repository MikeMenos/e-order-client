import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export type SupplierTempHideFromListPayload = {
  supplierUID: string;
  refDate: null;
  hideFromList: boolean;
};

export type SupplierTempHideFromListResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
};

export function useSupplierTempHideFromList(options?: {
  onSuccess?: (
    data: SupplierTempHideFromListResponse,
    variables: SupplierTempHideFromListPayload,
  ) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (
      payload: SupplierTempHideFromListPayload,
    ): Promise<SupplierTempHideFromListResponse> => {
      const res = await api.post<SupplierTempHideFromListResponse>(
        "/supplier-temp-hide-from-list",
        payload,
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      onSuccess?.(data, variables);
    },
    onError,
  });
}
