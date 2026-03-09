import { useMemo, useState } from "react";
import { useNotificationsGetItems } from "./useNotifications";
import type { NotificationItem } from "@/lib/types/notifications";

export function useNotificationsWithSearch() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadQuery = useNotificationsGetItems({ isRead: false, page });
  const readQuery = useNotificationsGetItems({ isRead: true, page });

  const notifications = useMemo(() => {
    const unread = unreadQuery.data?.listNotifications ?? [];
    const read = readQuery.data?.listNotifications ?? [];
    return [...unread, ...read];
  }, [unreadQuery.data?.listNotifications, readQuery.data?.listNotifications]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n: NotificationItem) =>
        (n.title ?? "").toLowerCase().includes(q) ||
        (n.message ?? "").toLowerCase().includes(q),
    );
  }, [notifications, searchQuery]);

  const totalPages = Math.max(
    unreadQuery.data?.totalPages ?? 0,
    readQuery.data?.totalPages ?? 0,
  );
  const isLoading = unreadQuery.isLoading || readQuery.isLoading;
  const isError = unreadQuery.isError || readQuery.isError;

  return {
    notifications,
    filteredNotifications,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    isLoading,
    isError,
  };
}
