import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

const APP_VERSION = "1.0.0";

/** Body sent to POST /api/register (digest/timeToken are added server-side). */
export type RegisterPayload = {
  /** From User_CheckVat; required when registration follows VAT lookup. */
  registrationUID?: string;
  companyName: string;
  vat: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  mainActivity: string;
  contactPerson: string;
  contactPersonPhone: string;
  accountFname: string;
  accountLname: string;
  accountUsername: string;
  accountEmail: string;
  accountMobile: string;
  accountPassword1: string;
  accountPassword2: string;
};

export type RegisterResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
  /** Returned by User_Register; used for User_VerifyAccount */
  registrationUID?: string;
  RegistrationUID?: string;
  /** Legacy; prefer registrationUID */
  appUserUID?: string | number;
  AppUserUID?: string | number;
};

export function useRegister(options?: {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await api.post<RegisterResponse>("/register", {
        ...payload,
        platform: "web",
        appVersion: APP_VERSION,
      });
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError,
  });
}
