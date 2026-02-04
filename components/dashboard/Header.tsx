"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { useTranslation } from "../../lib/i18n";
import { Button } from "../ui/button";

type Props = {
  embedded?: boolean;
  showBack?: boolean;
};

export function DashboardHeader({ embedded, showBack }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { users, selectedUser } = useAuthStore();

  const fname = useMemo(
    () => users?.userInfos?.fname ?? "",
    [users?.userInfos?.fname]
  );

  const storeTitle =
    selectedUser?.store?.title ??
    users?.store?.title ??
    users?.role?.store?.title ??
    "";

  const role = selectedUser?.userType ?? users?.role?.userType ?? "";
  const profilePic = users?.userInfos?.profilePic;
  const userTypeId =
    selectedUser?.userTypeId ??
    users?.role?.userTypeId ??
    users?.userInfos?.storeAccess?.[0]?.userTypeId;

  const headerBg =
    "bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90";
  const borderCls = "border-slate-200/80";

  return (
    <header
      className={`flex items-center gap-3 border-b ${borderCls} ${headerBg} px-3 py-2 w-full min-w-0`}
    >
      {showBack && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="inline-flex shrink-0 p-0 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-200/50"
          aria-label={t("common_back")}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Button>
      )}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
        {/* <Link href="/dashboard">
          <img
            src="/assets/logo.png"
            alt="E-Order"
            className="h-14 w-14 rounded-lg object-contain"
          />
        </Link> */}
      </div>
      <div className="min-w-0 flex-1">
        {fname && (
          <p className="text-sm font-medium text-slate-900">
            {fname}
            {role && profilePic && (
              <span className="ml-1 inline-flex align-middle text-sm font-normal text-slate-500">
                <img
                  src={profilePic}
                  alt={userTypeId === 2 ? "Admin" : "Employee"}
                  className="inline-block h-5 w-5 object-contain"
                  aria-hidden
                />
              </span>
            )}
          </p>
        )}
        {storeTitle && (
          <p className="truncate text-sm text-slate-500">{storeTitle}</p>
        )}
      </div>

    </header>
  );
}
