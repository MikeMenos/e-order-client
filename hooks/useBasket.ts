import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useBasketItems = () => {
  return useQuery({
    queryKey: ["basket-items"],
    queryFn: async () => {
      const res = await api.get("Basket/Basket_GetItems", {
        params: {},
      });
      return res.data;
    },
  });
};

export const useBasketCounter = () => {
  return useQuery({
    queryKey: ["basket-counter"],
    queryFn: async () => {
      const res = await api.get("Basket/Basket_GetCounter", {
        params: {},
      });
      return res.data;
    },
  });
};

