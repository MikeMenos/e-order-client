import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const usePrefSchedule = () => {
  return useQuery({
    queryKey: ["pref-schedule"],
    queryFn: async () => {
      const res = await api.post("/store-pref-schedule");
      return res.data;
    },
  });
};
