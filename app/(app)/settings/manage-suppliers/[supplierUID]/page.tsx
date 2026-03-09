"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { TileCard } from "@/components/ui/tile-card";
import Loading from "@/components/ui/loading";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";
import { useAuthStore } from "@/stores/auth";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { SuppliersListItem } from "@/lib/types/dashboard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePrefCollaborationUpdate } from "@/hooks/usePrefCollaborationUpdate";

export default function ManageSupplierMenuPage() {
  const { t } = useTranslation();
  const { hasAccess } = useUserPermissions();
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

  const updateCollaborationMutation = usePrefCollaborationUpdate({
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      router.push("/settings/manage-suppliers");
    },
  });

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
        <Loading spinnerOnly />
      </main>
    );
  }

  if (isError || !selectedSupplier) {
    return (
      <main className="px-3 text-slate-900">
        <p className="text-base text-slate-500">{t("suppliers_error")}</p>
      </main>
    );
  }

  return (
    <main className="px-3 text-slate-900">
      <div className="mx-auto flex max-w-xl flex-col mt-2">
        <div className="my-3 flex items-center justify-center gap-3">
          {selectedSupplier.logo && (
            <img
              src={selectedSupplier.logo}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full bg-slate-100 object-contain"
            />
          )}
          <h1 className="text-xl font-bold text-slate-900 text-center">
            {selectedSupplier.title ?? selectedSupplier.subTitle}
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
            iconSrc="/assets/manage-products.png"
            label={t("settings_edit_products")}
            horizontal={true}
            onClick={() =>
              router.push(
                `/settings/manage-suppliers/${selectedSupplier.supplierUID}/manage-products`,
              )
            }
          />

          {hasAccess("P5") && (
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
          )}

          <div className="flex flex-row items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
            <span className="text-lg font-semibold text-slate-900">
              {t("settings_hide_supplier")}
            </span>
            <Switch
              checked={!(selectedSupplier.isApproved ?? true)}
              onCheckedChange={(checked) => {
                updateCollaborationMutation.mutate({
                  supplierUID: selectedSupplier.supplierUID,
                  isApproved: !checked,
                });
              }}
              disabled={updateCollaborationMutation.isPending}
              aria-label={t("settings_hide_supplier")}
            />
          </div>
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
