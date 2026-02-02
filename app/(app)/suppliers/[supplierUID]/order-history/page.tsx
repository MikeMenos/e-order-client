"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { format, subDays } from "date-fns";
import { ArrowLeft } from "lucide-react";
import {
  useSupplierOrderHistory,
  type OrderHistoryOrder,
} from "@/hooks/useSupplierOrderHistory";
import { useOrderView } from "@/hooks/useOrderView";
import { DashboardHeader } from "@/components/dashboard/Header";
import { OrderHistoryTile } from "@/components/supplier/OrderHistoryTile";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SupplierOrderHistoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const searchParams = useSearchParams();
  const supplierUID = params.supplierUID;
  const refDate = searchParams.get("refDate") ?? "";
  const backHref = `/suppliers/${supplierUID}${
    refDate ? `?refDate=${encodeURIComponent(refDate)}` : ""
  }`;

  const [expandedOrderUID, setExpandedOrderUID] = useState<string | null>(null);

  const dateTo = format(new Date(), "yyyy-MM-dd");
  const dateFrom = format(subDays(new Date(), 60), "yyyy-MM-dd");

  const ordersQuery = useSupplierOrderHistory(supplierUID, {
    dateFrom,
    dateTo,
    page: 1,
  });
  const orderViewQuery = useOrderView(expandedOrderUID);

  const orders = ordersQuery.data?.listOrders ?? [];

  const toggleExpanded = (orderUID: string) => {
    setExpandedOrderUID((prev) => (prev === orderUID ? null : orderUID));
  };

  const getItemsForOrder = (o: OrderHistoryOrder) => {
    if (expandedOrderUID !== o.orderUID) return [];
    const fromView = orderViewQuery.data?.order?.items;
    if (fromView && fromView.length > 0) return fromView;
    return o.items ?? [];
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 backdrop-blur supports-backdrop-filter:bg-slate-50/90">
        <DashboardHeader embedded />
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href={backHref}
              aria-label={t("common_back")}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-white"
              )}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
            <p className="truncate text-sm font-semibold text-slate-900">
              {t("supplier_order_history_title")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-4">
        {ordersQuery.isLoading && (
          <p className="text-sm text-slate-500">
            {t("supplier_order_history_loading")}
          </p>
        )}
        {ordersQuery.error && (
          <p className="text-sm text-red-400">
            {t("supplier_order_history_error")}
          </p>
        )}
        {orders.length === 0 && !ordersQuery.isLoading && (
          <p className="text-sm text-slate-600">
            {t("supplier_order_history_empty")}
          </p>
        )}
        {orders.length > 0 && (
          <div className="space-y-2">
            {orders.map((o: OrderHistoryOrder) => (
              <OrderHistoryTile
                key={o.orderUID}
                order={o}
                isExpanded={expandedOrderUID === o.orderUID}
                onToggleExpand={() => toggleExpanded(o.orderUID)}
                items={getItemsForOrder(o)}
                itemsLoading={
                  expandedOrderUID === o.orderUID && orderViewQuery.isFetching
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
