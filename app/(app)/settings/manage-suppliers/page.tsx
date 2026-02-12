"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, History, User } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "@/lib/i18n";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import { TileCard } from "@/components/ui/tile-card";
import { SuppliersListItem } from "@/lib/types/dashboard";
import { useAuthStore } from "@/stores/auth";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

export default function ManageSuppliersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const menuUid = searchParams.get("menu");
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  const { refDate, suppliers, isLoading, isError, errorMessage } =
    useSuppliersListForToday();

  const { users, setSelectedUser, setStoreAccessToken, setLoggedIn } =
    useAuthStore();

  const roles = useMemo(
    () => users?.userInfos?.storeAccess ?? [],
    [users?.userInfos?.storeAccess],
  );

  const userName = useMemo(
    () =>
      [users?.userInfos?.fname, users?.userInfos?.lname]
        .filter(Boolean)
        .join(" ") || "",
    [users?.userInfos?.fname, users?.userInfos?.lname],
  );

  const selectedSupplier = React.useMemo(
    () =>
      menuUid && suppliers?.length
        ? (suppliers.find(
            (s: SuppliersListItem) => s.supplierUID === menuUid,
          ) ?? null)
        : null,
    [menuUid, suppliers],
  );
  const isMenuStep = Boolean(menuUid && selectedSupplier);

  const handleSupplierClick = React.useCallback(
    (s: SuppliersListItem) => {
      router.push(`/settings/manage-suppliers?menu=${s.supplierUID}`);
    },
    [router],
  );

  const handleSelectRole = (role: { store?: { storeUID?: string } }) => {
    setStoreDialogOpen(false);

    setSelectedUser(role);
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
          queryClient.invalidateQueries();
        })
        .catch((err) => {
          console.error("select-store failed", err);
          toast.error(
            getApiErrorMessage(err, t("settings_select_store_error")),
          );
        });
    }

    router.push("/dashboard");
  };

  return (
    <main className="text-slate-900 px-3">
      {!isMenuStep ? (
        <SuppliersSection
          refDate={refDate}
          suppliers={suppliers}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          onSupplierClick={handleSupplierClick}
        />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col mt-2">
          {selectedSupplier && (
            <>
              <div className="my-4 rounded-xl border border-slate-200 bg-app-card/95 p-4 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 text-center">
                  {selectedSupplier.title}
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4">
                {/* Store Selection - First on mobile */}
                {roles.length > 1 && (
                  <TileCard
                    icon={Store}
                    label={t("store_select_title")}
                    iconColor="text-slate-700"
                    horizontal={true}
                    onClick={() => setStoreDialogOpen(true)}
                  />
                )}

                {/* Supplier Details - Second on mobile */}
                <TileCard
                  iconSrc="/assets/supplier-info.png"
                  label={t("settings_supplier_details")}
                  horizontal={true}
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/info?from=settings`,
                    )
                  }
                />

                {/* Order Schedule - Third on mobile */}
                <TileCard
                  iconSrc="/assets/order-calendar.png"
                  label={t("settings_order_schedule")}
                  horizontal={true}
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/timetable?from=settings`,
                    )
                  }
                />

                {/* Favorites - Fourth on mobile */}
                <TileCard
                  iconSrc="/assets/favorites.png"
                  label={t("settings_favorites")}
                  horizontal={true}
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/favorites?from=settings`,
                    )
                  }
                />

                {/* Order History - Below favorites */}
                <TileCard
                  icon={History}
                  label={t("settings_order_history")}
                  iconColor="text-blue-600"
                  horizontal={true}
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/order-history?from=settings`,
                    )
                  }
                />

                {/* Contact - Below favorites */}
                <TileCard
                  icon={User}
                  label={t("settings_contact")}
                  iconColor="text-slate-700"
                  horizontal={true}
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/contact?from=settings`,
                    )
                  }
                />
              </div>

              <StoreSelectDialog
                open={storeDialogOpen}
                onOpenChange={setStoreDialogOpen}
                roles={roles}
                userName={userName || undefined}
                onSelectRole={handleSelectRole}
              />
            </>
          )}
        </div>
      )}
    </main>
  );
}
