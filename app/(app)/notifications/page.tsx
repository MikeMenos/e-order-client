"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";
import { useBackToTop } from "@/hooks/useBackToTop";
import Loading from "@/components/ui/loading";
import { useNotificationsMarkAsRead } from "@/hooks/useNotifications";
import { useNotificationsWithSearch } from "@/hooks/useNotificationsWithSearch";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const headerHeight = useAppHeaderHeight();
  const [activeTab, setActiveTab] = useState("notifications");
  const {
    notifications,
    filteredNotifications,
    page,
    setPage,
    totalPages,
    isLoading,
    isError,
  } = useNotificationsWithSearch();

  const showBackToTop = useBackToTop();

  const markAsReadMutation = useNotificationsMarkAsRead({
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
  });

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.isRead,
  ).length;

  const showMarkAllRead =
    !isLoading &&
    !isError &&
    notifications.length > 0 &&
    notifications.some((n) => !n.isRead);

  const markAllReadRow = showMarkAllRead ? (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="sm"
        disabled={markAsReadMutation.isPending}
        onClick={() => markAsReadMutation.mutate(null)}
        className="h-auto min-h-7 max-w-[min(100%,18rem)] px-2 py-1 text-xs font-normal leading-snug whitespace-normal text-right"
      >
        {t("notifications_mark_all_read")}
      </Button>
    </div>
  ) : null;

  return (
    <main className="space-y-4 text-slate-900 px-2 pb-12">
      <h1 className="sr-only">{t("nav_notifications")}</h1>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full gap-0"
      >
        <div
          className="sticky z-20 -mx-3 flex shrink-0 flex-col gap-2 bg-app-bg-solid px-3 pt-2 shadow-sm"
          style={{ top: headerHeight }}
        >
          <TabsList
            variant="line"
            className="mb-1 grid h-auto w-full min-h-11 grid-cols-2 rounded-none bg-transparent p-0"
          >
            <TabsTrigger
              value="messages"
              className={cn(
                "rounded-none border-0 bg-transparent px-2 py-2.5 text-base shadow-none",
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
              )}
            >
              {t("notifications_tab_messages")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={cn(
                "rounded-none border-0 bg-transparent px-2 py-2.5 text-base shadow-none",
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "gap-1.5",
              )}
            >
              <span>{t("notifications_tab_notifications")}</span>
              {unreadNotificationsCount > 0 && (
                <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white tabular-nums">
                  {unreadNotificationsCount > 99
                    ? "99+"
                    : unreadNotificationsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="messages" className="mt-4 space-y-4">
          <EmptyState>{t("notifications_messages_empty")}</EmptyState>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          {isLoading && <Loading spinnerOnly />}
          {isError && <ErrorMessage>{t("suppliers_error")}</ErrorMessage>}

          {!isLoading && !isError && notifications.length === 0 && (
            <EmptyState>{t("notifications_empty")}</EmptyState>
          )}
          {!isLoading &&
            !isError &&
            notifications.length > 0 &&
            filteredNotifications.length === 0 && (
              <div className="space-y-2">
                {markAllReadRow}
                <EmptyState>{t("notifications_no_matches")}</EmptyState>
              </div>
            )}
          {!isLoading && !isError && filteredNotifications.length > 0 && (
            <div className="space-y-3">
              {markAllReadRow}
              {filteredNotifications.map((item) => (
                <NotificationCard
                  key={item.notificationUID}
                  item={item}
                  isMarking={markAsReadMutation.isPending}
                  onMarkAsRead={(uid) => markAsReadMutation.mutate(uid)}
                />
              ))}
            </div>
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            prevLabel={t("erg_prev_page")}
            nextLabel={t("erg_next_page")}
          />
        </TabsContent>
      </Tabs>

      <BackToTopButton
        show={showBackToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        ariaLabel={t("nav_back_to_top")}
      />
    </main>
  );
}
