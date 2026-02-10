"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Users, User, History, Clock, MessageSquare } from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import { TileCard } from "@/components/ui/tile-card";
import { SuppliersListItem } from "@/lib/types/dashboard";

export default function ManageSuppliersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuUid = searchParams.get("menu");

  const { refDate, suppliers, isLoading, isError, errorMessage } =
    useSuppliersListForToday();

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

  return (
    <main className="text-slate-900">
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
                <h1 className="text-xl font-bold text-slate-900">
                  {selectedSupplier.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 auto-rows-fr gap-4">
                <TileCard
                  icon={Clock}
                  label={t("settings_order_schedule")}
                  iconColor="text-green-600"
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/timetable?from=settings`,
                    )
                  }
                />
                <TileCard
                  icon={Star}
                  label={t("settings_favorites")}
                  iconColor="text-orange-500"
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/favorites?from=settings`,
                    )
                  }
                />
                <TileCard
                  icon={History}
                  label={t("settings_order_history")}
                  iconColor="text-blue-600"
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/order-history?from=settings`,
                    )
                  }
                />
                <TileCard
                  icon={Users}
                  label={t("settings_supplier_details")}
                  iconColor="text-slate-700"
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/info?from=settings`,
                    )
                  }
                />
                <TileCard
                  icon={User}
                  label={t("settings_contact")}
                  iconColor="text-slate-700"
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/contact?from=settings`,
                    )
                  }
                />
                <TileCard
                  icon={MessageSquare}
                  label={t("settings_reviews")}
                  iconColor="text-yellow-500"
                  onClick={() =>
                    router.push(
                      `/suppliers/${selectedSupplier.supplierUID}/reviews?from=settings`,
                    )
                  }
                />
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
