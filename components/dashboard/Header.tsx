"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home, Bell } from "lucide-react";
import { useAuthStore, useEffectiveSelectedUser } from "../../stores/auth";
import { useNavigationHistory } from "@/app/(app)/NavigationHistoryContext";
import { useNotificationsCountUnread } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const users = useAuthStore((s) => s.users);
  const { data: countData } = useNotificationsCountUnread();
  const unreadCount = countData?.unreadCounter ?? 0;
  const effectiveUser = useEffectiveSelectedUser();
  const { canGoBack, goBack } = useNavigationHistory();
  const isDashboard = pathname === "/dashboard";

  const storeTitle = useMemo(
    () =>
      effectiveUser?.store?.title ??
      users?.store?.title ??
      users?.role?.store?.title ??
      "",
    [
      effectiveUser?.store?.title,
      users?.store?.title,
      users?.role?.store?.title,
    ],
  );

  if (isDashboard) return null;

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-transparent px-3 py-2 w-full min-w-0 border-b-0 min-h-18">
      <div className="flex justify-start">
        {canGoBack ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-slate-200"
            onClick={goBack}
            aria-label="Back"
          >
            <ChevronLeft className="h-8 w-8 text-brand-500" aria-hidden />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <Link href="/dashboard" className="inline-block shrink-0">
          <img
            src="/assets/logo.png"
            alt="E-Order"
            className="h-15 w-15 object-contain"
          />
        </Link>
        {storeTitle && (
          <p className="mt-0.5 text-base font-medium text-slate-600 line-clamp-1 max-w-48">
            {storeTitle}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-1">
        {/* <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50"
        >
          <Bell className="h-6 w-6 text-brand-500" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link> */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-slate-200"
        >
          <Link href="/dashboard" aria-label="Home">
            <Home className="h-8 w-8 text-brand-500" aria-hidden />
          </Link>
        </Button>
      </div>
    </header>
  );
}
