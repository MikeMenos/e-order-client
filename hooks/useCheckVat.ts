import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export type CheckVatInfo = {
  vat?: string;
  taxOffice?: string;
  companyName?: string;
  postalCode?: string;
  address?: string;
  city?: string;
  mainActivity?: string;
};

export type CheckVatResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
  registrationUID?: string;
  hasFoundData?: boolean;
  info?: CheckVatInfo;
};

export type CheckVatPayload = {
  vat: string;
  postalCode: string;
};

export function useCheckVat(options?: {
  onSuccess?: (data: CheckVatResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: CheckVatPayload) => {
      const res = await api.post<CheckVatResponse>("/check-vat", payload);
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError,
  });
}
