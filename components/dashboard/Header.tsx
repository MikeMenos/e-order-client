"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth";
import { useTranslation } from "../../lib/i18n";
import { Button } from "../ui/button";

type Props = {
  embedded?: boolean;
};

export function DashboardHeader({ embedded }: Props = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { users, selectedUser, logout } = useAuthStore();

  const fname = useMemo(
    () => users?.userInfos?.fname ?? "",
    [users?.userInfos?.fname],
  );

  const storeTitle =
    selectedUser?.store?.title ??
    users?.store?.title ??
    users?.role?.store?.title ??
    "";

  const role = selectedUser?.userType ?? users?.role?.userType ?? "";
  const userTypeId =
    selectedUser?.userTypeId ??
    users?.role?.userTypeId ??
    users?.userInfos?.storeAccess?.[0]?.userTypeId;
  const roleImageSrc =
    userTypeId === 2 ? "/assets/captain.png" : "/assets/employee.png";

  return (
    <header
      className={
        embedded
          ? "flex items-center gap-3 border-b border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur supports-backdrop-filter:bg-slate-50/90"
          : "sticky top-0 z-20 -mx-5 -mt-5 flex items-center gap-3 border-b border-slate-200 bg-slate-50/95 px-5 py-3 backdrop-blur supports-backdrop-filter:bg-slate-50/90"
      }
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-14 w-14 rounded-lg object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        {fname && (
          <p className="text-sm font-medium text-slate-900">
            {fname}
            {role && (
              <span className="inline-flex align-middle text-sm font-normal text-slate-500">
                {" "}
                <img
                  src={roleImageSrc}
                  alt={userTypeId === 2 ? "Admin" : "Employee"}
                  className="ml-1 inline-block h-5 w-5 object-contain"
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
      <Button
        className="text-white bg-red-500"
        size="sm"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        {t("logout")}
      </Button>
    </header>
  );
}
