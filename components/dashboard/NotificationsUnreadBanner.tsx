"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useNotificationsCountUnread } from "@/hooks/useNotifications";
import { InterpolatedText } from "@/components/ui/interpolated-text";

export function NotificationsUnreadBanner() {
  const { t } = useTranslation();
  const { data: countData } = useNotificationsCountUnread();
  const unreadCount = countData?.unreadCounter ?? 0;

  if (unreadCount <= 0) return null;

  return (
    <Link
      href="/notifications"
      className="mx-auto mb-4 flex max-w-xl items-center justify-center gap-2 rounded-xl border-2 border-brand-500 bg-brand-50 px-4 py-3 text-brand-800 transition hover:bg-brand-100"
    >
      <Bell className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
      <span className="font-medium">
        <InterpolatedText
          template={t("dashboard_unread_banner")}
          values={{ count: unreadCount }}
          highlightedKey="count"
          highlightedClassName="mx-0.5 font-bold text-lg"
        />
      </span>
    </Link>
  );
}
