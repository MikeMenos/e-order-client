"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/auth";
import { useTranslation } from "../../lib/i18n";
import { api } from "../../lib/api";
import { StoreSelectDialog } from "../auth/StoreSelectDialog";
import { HeaderDrawer } from "./HeaderDrawer";
import Link from "next/link";
import { format, parseISO } from "date-fns";

type Props = {
  selectedDate?: string;
  embedded?: boolean;
};

export function DashboardHeader({ embedded, selectedDate }: Props) {
  const date =
    typeof selectedDate === "string"
      ? parseISO(selectedDate)
      : selectedDate ?? new Date();

  const day = format(date, "dd");
  const rest = format(date, "EEE MMM yyyy");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const {
    users,
    selectedUser,
    logout,
    setSelectedUser,
    setStoreAccessToken,
    setLoggedIn,
  } = useAuthStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

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

  const roles = useMemo(
    () => users?.userInfos?.storeAccess ?? [],
    [users?.userInfos?.storeAccess]
  );

  const userName = useMemo(
    () =>
      [users?.userInfos?.fname, users?.userInfos?.lname]
        .filter(Boolean)
        .join(" ") || "",
    [users?.userInfos?.fname, users?.userInfos?.lname]
  );

  const handleGoHome = () => {
    setDrawerOpen(false);
    router.push("/");
  };

  const handleSwitchStore = () => {
    setDrawerOpen(false);
    setStoreDialogOpen(true);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    router.push("/");
  };

  const handleSelectRole = (role: any) => {
    setStoreDialogOpen(false);
    setSelectedUser(role);
    // Mirror login flow: update users.role so store-scoped data stays in sync
    if (users) {
      setLoggedIn({
        isLoggedIn: true,
        isAddUser: false,
        users: { ...users, role },
      });
    }
    const storeUID = role?.store?.storeUID ?? null;
    if (storeUID) {
      api
        .get("/select-store", { params: { StoreUID: storeUID } })
        .then((res) => {
          setStoreAccessToken(res.data?.accessToken ?? null);
          // Invalidate store-dependent queries so supplier list, dashboard, basket, etc. refetch
          queryClient.invalidateQueries();
        })
        .catch((err) => {
          console.error("select-store failed", err);
        });
    }
  };

  return (
    <>
      <header
        className={
          embedded
            ? "flex items-center gap-3 border-b border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur supports-backdrop-filter:bg-slate-50/90"
            : "sticky top-0 z-20 -mx-5 -mt-5 flex items-center gap-3 border-b border-slate-200 bg-slate-50/95 px-5 py-3 backdrop-blur supports-backdrop-filter:bg-slate-50/90"
        }
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <Link href="/dashboard">
            <img
              src="/assets/logo.png"
              alt="E-Order"
              className="h-14 w-14 rounded-lg object-contain"
            />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          {fname && (
            <p className="text-sm font-medium text-slate-900">
              {fname}
              {role && (
                <span className="inline-flex align-middle text-sm font-normal text-slate-500">
                  {" "}
                  <img
                    src={profilePic}
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

        {selectedDate && (
          <p className="text-slate-900 flex items-baseline">
            <span className="font-bold text-2xl mr-1">{day}</span>
            <span className="text-sm font-medium text-slate-500">{rest}</span>
          </p>
        )}

        <HeaderDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onGoHome={handleGoHome}
          onSwitchStore={handleSwitchStore}
          onLogout={handleLogout}
          rolesCount={roles.length}
        />
      </header>

      <StoreSelectDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        roles={roles}
        userName={userName || undefined}
        onSelectRole={handleSelectRole}
      />
    </>
  );
}
