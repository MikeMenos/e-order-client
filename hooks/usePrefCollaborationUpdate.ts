import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function usePrefCollaborationUpdate(options?: {
  onSuccess?: (data: { message?: string }) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: {
      supplierUID: string;
      isApproved: boolean;
    }) => {
      const res = await api.post<{ message?: string }>(
        "/pref-collaboration-update",
        payload,
      );
      return res.data;
    },
    onSuccess: (data, _payload) => {
      onSuccess?.(data);
      void queryClient.invalidateQueries({ queryKey: ["suppliers-no-partners"] });
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError,
  });
}
