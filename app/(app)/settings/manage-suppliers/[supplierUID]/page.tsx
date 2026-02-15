"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { TileCard } from "@/components/ui/tile-card";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { SuppliersListItem } from "@/lib/types/dashboard";

export default function ManageSupplierMenuPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  const { suppliers, isLoading, isError } = useSuppliersListForToday();

  const {
    users,
    setSelectedUser,
    setStoreAccessToken,
    setSelectedStoreUID,
    setLoggedIn,
  } = useAuthStore();

  const queryClient = useQueryClient();

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

  const selectedSupplier = useMemo(
    (): SuppliersListItem | null =>
      supplierUID && suppliers?.length
        ? (suppliers.find(
            (s: SuppliersListItem) => s.supplierUID === supplierUID,
          ) ?? null)
        : null,
    [supplierUID, suppliers],
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
          setSelectedStoreUID(storeUID);
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

  if (isLoading || !supplierUID) {
    return (
      <main className="px-3 text-slate-900">
        <p className="text-base text-slate-500">{t("suppliers_loading")}</p>
      </main>
    );
  }

  if (isError || !selectedSupplier) {
    return (
      <main className="px-3 text-slate-900">
        <p className="text-base text-slate-500">{t("suppliers_error")}</p>
        <button
          type="button"
          onClick={() => router.push("/settings/manage-suppliers")}
          className="mt-2 text-base text-brand-600 underline"
        >
          {t("common_back")}
        </button>
      </main>
    );
  }

  return (
    <main className="px-3 text-slate-900">
      <div className="mx-auto flex max-w-xl flex-col mt-2">
        <div className="my-4">
          <h1 className="text-xl font-bold text-slate-900 mt-2 text-center">
            {selectedSupplier.subTitle ?? selectedSupplier.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4">
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

          <TileCard
            iconSrc="/assets/order-history.png"
            label={t("settings_order_history")}
            iconColor="text-blue-600"
            horizontal={true}
            onClick={() =>
              router.push(
                `/suppliers/${selectedSupplier.supplierUID}/order-history?from=settings`,
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
      </div>
    </main>
  );
}
