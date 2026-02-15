"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { useAuthStore, useEffectiveSelectedUser } from "../../stores/auth";
import { useNavigationHistory } from "@/app/(app)/NavigationHistoryContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const users = useAuthStore((s) => s.users);
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
    <header className="flex items-center justify-between gap-3 bg-transparent px-3 py-2.5 w-full min-w-0 border-b-0">
      <div className="flex w-14 shrink-0 justify-start">
        {canGoBack ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-slate-200"
            onClick={goBack}
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-brand-500" aria-hidden />
          </Button>
        ) : (
          <span className="w-9" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
        <Link href="/dashboard" className="inline-block shrink-0">
          <img
            src="/assets/logo.png"
            alt="E-Order"
            className="h-16 w-16 rounded-lg object-contain"
          />
        </Link>
        {storeTitle && (
          <p className="mt-1 text-base font-medium text-slate-600 line-clamp-1">
            {storeTitle}
          </p>
        )}
      </div>

      <div className="flex w-14 shrink-0 justify-end">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-slate-200"
        >
          <Link href="/dashboard" aria-label="Home">
            <Home className="h-6 w-6 text-brand-500" aria-hidden />
          </Link>
        </Button>
      </div>
    </header>
  );
}
