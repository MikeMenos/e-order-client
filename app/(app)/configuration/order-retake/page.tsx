"use client";

import { useOrdersList } from "../../../../hooks/useOrders";
import { useTranslation } from "../../../../lib/i18n";

export default function OrderRetakePage() {
  const { t } = useTranslation();
  const ordersQuery = useOrdersList(0, 50);

  const orders = ordersQuery.data?.ordersList ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{t("config_order_retake_title")}</h1>
        <p className="text-sm text-slate-600">
          {t("config_order_retake_subtitle")}
        </p>
      </header>

      {ordersQuery.isLoading && (
        <p className="text-sm text-slate-500">{t("config_loading_orders")}</p>
      )}
      {ordersQuery.error && (
        <p className="text-sm text-red-400">{t("config_error_orders")}</p>
      )}

      {orders.length === 0 && !ordersQuery.isLoading ? (
        <p className="text-sm text-slate-600">{t("config_empty_orders")}</p>
      ) : (
        <div className="space-y-2">
          {orders.map((o: any) => (
            <div
              key={o.orderUID}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {o.supplierTitle ?? t("config_order_fallback")}
                </p>
                <p className="truncate text-sm text-slate-600">{o.orderUID}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-slate-700">
                  {o.orderDateFormatted ?? o.orderDate}
                </p>
                {typeof o.totalAmount === "number" && (
                  <p className="text-sm font-semibold text-slate-900">
                    {o.totalAmount.toFixed(2)} {o.currency ?? ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
