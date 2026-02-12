"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";
import {
  useSupplierOrderHistory,
  type OrderHistoryOrder,
} from "@/hooks/useSupplierOrderHistory";
import { useOrderView } from "@/hooks/useOrderView";
import { OrderHistoryTile } from "@/components/supplier/OrderHistoryTile";
import { useTranslation } from "@/lib/i18n";
import { listVariants, listItemVariants } from "@/lib/motion";

export default function SupplierOrderHistoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;

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
    <main className="pb-12 text-slate-900">
      <div>
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
          <p className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {t("supplier_order_history_empty")}
          </p>
        )}
        {orders.length > 0 && (
          <motion.div
            className="space-y-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {orders.map((o: OrderHistoryOrder) => (
              <motion.div key={o.orderUID} variants={listItemVariants}>
                <OrderHistoryTile
                  order={o}
                  isExpanded={expandedOrderUID === o.orderUID}
                  onToggleExpand={() => toggleExpanded(o.orderUID)}
                  items={getItemsForOrder(o)}
                  itemsLoading={
                    expandedOrderUID === o.orderUID && orderViewQuery.isFetching
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
