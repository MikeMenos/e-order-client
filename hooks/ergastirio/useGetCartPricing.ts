import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { CartPricingResponse } from "@/lib/ergastirio-interfaces";

export function useGetCartPricing({
  basketId,
  enabled,
}: { basketId: string | undefined; enabled: boolean }) {
  return useQuery<CartPricingResponse, Error>({
    queryKey: ["ergastirio", "cart-pricing", basketId],
    enabled: Boolean(enabled && basketId),
    queryFn: async () => {
      const { data } = await api.post<CartPricingResponse>(
        "/ergastirio/get-cart-pricing",
        { KEY: basketId }
      );
      return data;
    },
  });
}
