"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../stores/auth";

type Props = {
  embedded?: boolean;
};

export function DashboardHeader({ embedded }: Props) {
  const pathname = usePathname();
  const { users, selectedUser } = useAuthStore();
  const isDashboard = pathname === "/dashboard";

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
  const profilePic = users?.userInfos?.profilePic;
  const userTypeId =
    selectedUser?.userTypeId ??
    users?.role?.userTypeId ??
    users?.userInfos?.storeAccess?.[0]?.userTypeId;

  return (
    <header
      className={`flex items-center gap-3 bg-transparent px-3 py-2.5 w-full min-w-0 border-b-0`}
    >
      {!isDashboard && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <Link href="/dashboard">
            <img
              src="/assets/logo.png"
              alt="E-Order"
              className="h-14 w-14 rounded-lg object-contain"
            />
          </Link>
        </div>
      )}
      <div
        className={`min-w-0 flex-1 ${isDashboard ? "flex flex-col items-center justify-center text-center" : ""}`}
      >
        {fname && (
          <p className="text-base font-semibold text-slate-900">
            {fname}
            {role && profilePic && (
              <span className="ml-1.5 inline-flex align-middle">
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
          <p className="text-base font-medium text-slate-600">{storeTitle}</p>
        )}
      </div>
    </header>
  );
}
