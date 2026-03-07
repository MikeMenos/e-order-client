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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["pref-schedule"] });
      const previous = queryClient.getQueryData<PrefScheduleResponse>([
        "pref-schedule",
      ]);
      queryClient.setQueryData<PrefScheduleResponse>(
        ["pref-schedule"],
        (old) => {
          if (!old?.storeSchedules) return old;
          return {
            ...old,
            storeSchedules: old.storeSchedules.map((s) =>
              (s.supplierUID ?? "").toLowerCase() ===
              (payload.supplierUID ?? "").toLowerCase()
                ? {
                    ...s,
                    dailyProgram: (s.dailyProgram ?? []).map((d) =>
                      d.dayNum === payload.dayNum
                        ? { ...d, isMarked: payload.isMarked }
                        : d,
                    ),
                  }
                : s,
            ),
          };
        },
      );
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(["pref-schedule"], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["pref-schedule"] });
    },
  });
}
