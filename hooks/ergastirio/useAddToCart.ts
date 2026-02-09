import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddToCartPayload, CartResponse } from "@/lib/ergastirio-interfaces";
import { buildFirstBasketKeyPayload } from "@/lib/ergastirio-utils";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

export async function getFirstBasketKey(params: {
  trdr: number;
  branch: number;
}): Promise<string | undefined> {
  const payload = buildFirstBasketKeyPayload(params);
  const { data } = await api.post<CartResponse>("/ergastirio/add-to-cart", payload);
  if (data && (data as { success?: boolean }).success === false) {
    throw new Error((data as { error?: string }).error);
  }
  return (data as { id?: string })?.id;
}

async function postCart(payload: AddToCartPayload): Promise<CartResponse> {
  const { data } = await api.post<CartResponse>("/ergastirio/add-to-cart", payload);
  if (data && (data as { success?: boolean }).success === false) {
    throw new Error((data as { error?: string }).error);
  }
  return data as CartResponse;
}

export function useAddToCart() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<CartResponse, Error, AddToCartPayload>({
    mutationFn: postCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ergastirio", "cart"] });
    },
    onError: (error) => {
      toast.error(error?.message ?? t("erg_toast_error"));
    },
  });
}
