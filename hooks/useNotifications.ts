import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  NotificationsCountUnreadResponse,
  NotificationsGetItemsResponse,
} from "../lib/types/notifications";

export function useNotificationsCountUnread() {
  return useQuery({
    queryKey: ["notifications-count-unread"],
    queryFn: async () => {
      const res = await api.get<NotificationsCountUnreadResponse>(
        "/notifications-count-unread",
      );
      return res.data;
    },
  });
}

export type NotificationsGetItemsParams = {
  notificationUID?: string;
  isRead?: boolean;
  page?: number;
};

export function useNotificationsGetItems(params: NotificationsGetItemsParams) {
  const { notificationUID, isRead, page = 0 } = params;
  return useQuery({
    queryKey: ["notifications-get-items", notificationUID, isRead, page],
    queryFn: async () => {
      const body: Record<string, unknown> = { page };
      if (notificationUID != null) body.notificationUID = notificationUID;
      if (isRead != null) body.isRead = isRead;
      const res = await api.post<NotificationsGetItemsResponse>(
        "/notifications-get-items",
        body,
      );
      return res.data;
    },
  });
}

export function useNotificationsMarkAsRead(options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options ?? {};

  return useMutation({
    mutationFn: async (notificationUID: string | null) => {
      const res = await api.post("/notifications-mark-as-read", null, {
        params: { notificationUID },
      });
      return res.data;
    },
    onSuccess: () => {
      onSuccess?.();
      void queryClient.invalidateQueries({
        queryKey: ["notifications-count-unread"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["notifications-get-items"],
      });
    },
    onError,
  });
}
