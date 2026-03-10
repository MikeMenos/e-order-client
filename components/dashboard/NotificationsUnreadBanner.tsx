"use client";

import Link from "next/link";
import Image from "next/image";
import { useNotificationsCountUnread } from "@/hooks/useNotifications";

export function NotificationsUnreadBanner() {
  const { data: countData } = useNotificationsCountUnread();
  const unreadCount = countData?.unreadCounter ?? 0;

  return (
    <Link
      href="/notifications"
      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition opacity-90 hover:opacity-100 md:right-4"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
          : "Notifications"
      }
    >
      <div className="relative">
        <Image
          src="/assets/notifications.png"
          alt=""
          width={40}
          height={40}
          className="object-contain rounded-md"
          aria-hidden
        />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white"
            aria-hidden
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}
