import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export type VerifyAccountPayload = {
  appUserUID: string;
  smsCode: string | null;
  emailCode: string | null;
};

export type VerifyAccountResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
};

export function useVerifyAccount(options?: {
  onSuccess?: (
    data: VerifyAccountResponse,
    variables: VerifyAccountPayload,
  ) => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: VerifyAccountPayload) => {
      const res = await api.post<VerifyAccountResponse>(
        "/user-verify-account",
        payload,
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables);
    },
    onError,
  });
}
