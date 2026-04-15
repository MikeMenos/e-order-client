"use client";

import { useTranslation } from "@/lib/i18n";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";
import { useBackToTop } from "@/hooks/useBackToTop";
import Loading from "@/components/ui/loading";
import { useNotificationsMarkAsRead } from "@/hooks/useNotifications";
import { useNotificationsWithSearch } from "@/hooks/useNotificationsWithSearch";
import { Button } from "@/components/ui/button";
// import { SearchInput } from "@/components/ui/search-input";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const headerHeight = useAppHeaderHeight();
  const {
    notifications,
    filteredNotifications,
    searchQuery,
    setSearchQuery,
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

  return (
    <main className="space-y-4 text-slate-900 px-2 pb-12">
      <div
        className="sticky z-20 -mx-3 flex shrink-0 flex-col gap-2 bg-app-bg-solid px-3 pb-2 pt-2 shadow-sm"
        style={{ top: headerHeight }}
      >
        <h1 className="text-xl font-bold text-slate-900 text-center">
          {t("nav_notifications")}
        </h1>
        {notifications.length > 0 && (
          <>
            {/* <SearchInput
              placeholder={t("notifications_search_placeholder")}
              value={searchQuery}
              onChange={setSearchQuery}
              className="h-9 border border-slate-300 bg-white px-3 py-2 shadow-sm focus-visible:ring-0"
            /> */}
            {notifications.some((n) => !n.isRead) && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={markAsReadMutation.isPending}
                  onClick={() => markAsReadMutation.mutate(null)}
                >
                  {t("notifications_mark_all_read")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {isLoading && <Loading spinnerOnly />}
      {isError && <ErrorMessage>{t("suppliers_error")}</ErrorMessage>}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState>{t("notifications_empty")}</EmptyState>
      )}
      {!isLoading &&
        !isError &&
        notifications.length > 0 &&
        filteredNotifications.length === 0 && (
          <EmptyState>{t("notifications_no_matches")}</EmptyState>
        )}
      {!isLoading && !isError && filteredNotifications.length > 0 && (
        <div className="space-y-3">
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

      <BackToTopButton
        show={showBackToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        ariaLabel={t("nav_back_to_top")}
      />
    </main>
  );
}
