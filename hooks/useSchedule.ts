import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  PrefScheduleResponse,
  PrefScheduleUpdatePayload,
} from "../lib/types/schedule";

export type { PrefScheduleDay, PrefScheduleSupplier, PrefScheduleResponse, PrefScheduleUpdatePayload } from "../lib/types/schedule";

export const usePrefSchedule = () => {
  return useQuery({
    queryKey: ["pref-schedule"],
    queryFn: async (): Promise<PrefScheduleResponse> => {
      const res = await api.post<PrefScheduleResponse>("/store-pref-schedule");
      return res.data;
    },
  });
};

export function usePrefScheduleUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PrefScheduleUpdatePayload) => {
      const res = await api.post("/store-pref-schedule-update", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pref-schedule"] });
    },
  });
}
