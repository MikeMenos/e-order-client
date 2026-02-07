"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ArrowLeft,
  Users,
  User,
  History,
  Clock,
  Loader2,
  Building2,
  StarHalf,
  MessageSquare,
} from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import type { Supplier } from "@/components/dashboard/types";

const tileClass =
  "flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md active:scale-[0.99]";

export default function ManageSuppliersPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [suppliersStep, setSuppliersStep] = React.useState<"list" | "menu">(
    "list",
  );
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<Supplier | null>(null);

  const {
    suppliers,
    isLoading: suppliersLoading,
    isError: suppliersError,
    errorMessage,
  } = useSuppliersListForToday();

  return (
    <main className="text-slate-900">
      <div className="mx-auto flex max-w-md flex-col px-4 pb-8 pt-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/70"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" aria-hidden />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900">
              {t("Διαχείριση Προμηθευτών")}
            </h1>

            {suppliersStep === "menu" && selectedSupplier ? (
              <div className="mt-1 truncate text-sm font-medium text-slate-600">
                {selectedSupplier.title}
              </div>
            ) : (
              <div className="mt-1 text-sm font-medium text-slate-600">
                {t("Όλοι οι Προμηθευτές")}
              </div>
            )}
          </div>
        </div>

        {/* STEP: list */}
        {suppliersStep === "list" && (
          <>
            {suppliersLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t("suppliers_loading")}
              </div>
            )}

            {suppliersError && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {errorMessage ?? t("suppliers_error")}
              </div>
            )}

            {!suppliersLoading &&
              !suppliersError &&
              (suppliers?.length ?? 0) === 0 && (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  {t("suppliers_empty")}
                </div>
              )}

            {!suppliersLoading && !suppliersError && (
              <div className="grid grid-cols-1 auto-rows-fr gap-4">
                {(suppliers ?? []).map((s: Supplier) => (
                  <button
                    key={s.supplierUID}
                    type="button"
                    onClick={() => {
                      setSelectedSupplier(s);
                      setSuppliersStep("menu");
                    }}
                    className={tileClass}
                  >
                    {s.logo ? (
                      <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/80">
                        <img
                          src={s.logo}
                          alt={s.title ?? ""}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : (
                      <Building2
                        className="h-12 w-12 shrink-0 text-slate-700"
                        aria-hidden
                      />
                    )}

                    <span className="max-w-37.5 truncate text-center text-sm font-medium text-slate-900">
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {suppliersStep === "menu" && selectedSupplier && (
          <>
            <button
              type="button"
              onClick={() => {
                setSuppliersStep("list");
                setSelectedSupplier(null);
              }}
              className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-100/70 px-3 py-2 text-sm font-semibold text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t("Πίσω στους προμηθευτές")}
            </button>

            <div className="grid grid-cols-2 auto-rows-fr gap-4">
              <MenuTile
                label={t("Πρόγραμμα Παραγγελιών")}
                icon={Clock}
                iconColor="text-green-600"
                onClick={() =>
                  router.push(
                    `/suppliers/${selectedSupplier.supplierUID}/timetable`,
                  )
                }
              />
              <MenuTile
                label={t("Αγαπημένα")}
                icon={Star}
                iconColor="text-orange-500"
                onClick={() =>
                  router.push(
                    `/suppliers/${selectedSupplier.supplierUID}/favorites`,
                  )
                }
              />
              <MenuTile
                label={t("Ιστορικό Παραγγελιών")}
                icon={History}
                iconColor="text-blue-600"
                onClick={() =>
                  router.push(
                    `/suppliers/${selectedSupplier.supplierUID}/order-history`,
                  )
                }
              />
              <MenuTile
                label={t("Στοιχεία Προμηθευτή")}
                icon={Users}
                iconColor="text-slate-700"
                onClick={() =>
                  router.push(`/suppliers/${selectedSupplier.supplierUID}/info`)
                }
              />
              <MenuTile
                label={t("Επικοινωνία")}
                icon={User}
                iconColor="text-slate-700"
                onClick={() =>
                  router.push(
                    `/suppliers/${selectedSupplier.supplierUID}/contact`,
                  )
                }
              />
              <MenuTile
                label={t("Αξιολογήσεις")}
                icon={MessageSquare}
                iconColor="text-yellow-500"
                onClick={() =>
                  router.push(
                    `/suppliers/${selectedSupplier.supplierUID}/reviews`,
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MenuTile({
  label,
  icon: Icon,
  iconColor,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={tileClass}>
      <Icon className={`h-12 w-12 shrink-0 ${iconColor}`} aria-hidden />
      <span className="max-w-37.5 truncate text-center text-sm font-medium text-slate-900">
        {label}
      </span>
    </button>
  );
}
