"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { formatOrderDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { listVariants, listItemVariants } from "@/lib/motion";
import type {
  OrderHistoryOrder,
  OrderLineItem,
} from "@/hooks/useSupplierOrderHistory";

type Props = {
  order: OrderHistoryOrder;
  isExpanded: boolean;
  onToggleExpand: () => void;
  /** Line items for this order (from list API or Order_View) */
  items: OrderLineItem[];
  /** True when fetching order view for items */
  itemsLoading?: boolean;
};

export function OrderHistoryTile({
  order: o,
  isExpanded,
  onToggleExpand,
  items,
  itemsLoading = false,
}: Props) {
  const { t } = useTranslation();
  const borderColor = o.statusColor
    ? (o.statusColor as string).trim()
    : undefined;

  return (
    <div
      className="flex flex-col rounded-xl border-2 border-slate-200 bg-app-card/95 shadow-sm transition hover:border-slate-300"
      style={borderColor ? { borderColor } : undefined}
    >
      {/* Row: order date (replacing store title) + item count + chevron */}
      <div className="flex min-h-0 items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className=" text-slate-900">
            <span className="text-slate-500">{t("order_ref_date")}</span>{" "}
            {o.orderRefDateText ?? o.orderRefDate ?? "—"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {o.totalItems != null && (
            <p className="text-base text-slate-500">
              {o.totalItems} {t("order_items_count")}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-slate-500"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Expanded details + items */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-4 py-3  text-slate-600">
          <dl className="space-y-1 mb-1.5">
            {o.createdBy && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_created_by")}{" "}
                </dt>
                <dd className="inline">{o.createdBy}</dd>
              </div>
            )}
            {o.dateCreated && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_date_created")}{" "}
                </dt>
                <dd className="inline">{formatOrderDate(o.dateCreated)}</dd>
              </div>
            )}
            {o.deliveryDateText && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_delivery_date")}{" "}
                </dt>
                <dd className="inline">{o.deliveryDateText}</dd>
              </div>
            )}
            {o.nextAvailDeliveryMessage && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_next_delivery")}{" "}
                </dt>
                <dd className="inline">{o.nextAvailDeliveryMessage}</dd>
              </div>
            )}
            {o.shopperComments && (
              <div>
                <dt className="block font-medium text-slate-500">
                  {t("order_shopper_comments")}
                </dt>
                <dd className="mt-0.5 rounded bg-slate-50 px-2 py-1 text-slate-700">
                  {o.shopperComments}
                </dd>
              </div>
            )}
            {o.supplierComments && (
              <div>
                <dt className="block font-medium text-slate-500">
                  {t("order_supplier_comments")}
                </dt>
                <dd className="mt-0.5 rounded bg-slate-50 px-2 py-1 text-slate-700">
                  {o.supplierComments}
                </dd>
              </div>
            )}
          </dl>

          {/* Items purchased */}
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-2 text-base font-medium uppercase tracking-wide text-slate-500">
              {t("order_items")}
            </p>
            {itemsLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size={28} />
              </div>
            ) : items.length === 0 ? (
              <p className="text-base text-slate-500 bg-white/80 backdrop-blur-sm rounded px-2 py-1 inline-block">
                {t("order_items_empty")}
              </p>
            ) : (
              <motion.ul
                className="space-y-2"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {items.map((item, idx) => {
                  const qty =
                    item.quantity ??
                    (item as Record<string, unknown>).qty ??
                    (item as Record<string, unknown>).Quantity;
                  const hasQty = qty != null && qty !== "";
                  return (
                    <motion.li
                      key={item.productUID ?? idx}
                      variants={listItemVariants}
                      className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-slate-700"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {item.productTitle ??
                            item.productOriginalTitle ??
                            "—"}
                          {hasQty && (
                            <>
                              {" "}
                              <span className="font-normal text-slate-500 float-end">
                                {t("checkout_quantity")}: {String(qty)}
                              </span>
                            </>
                          )}
                        </p>
                        {item.productPackaging && (
                          <p className="text-base text-slate-500">
                            {item.productPackaging}
                          </p>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
