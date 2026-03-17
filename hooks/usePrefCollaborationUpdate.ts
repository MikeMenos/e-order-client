import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

type UpdatePayload = { supplierUID: string; isApproved: boolean };

export function usePrefCollaborationUpdate(options?: {
  onSuccess?: (data: { message?: string }, variables: UpdatePayload) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const res = await api.post<{ message?: string }>(
        "/pref-collaboration-update",
        payload,
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables);
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      void queryClient.invalidateQueries({
        queryKey: ["suppliers-manage-suppliers"],
      });
    },
    onError,
  });
}
