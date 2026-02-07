"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { formatOrderDate, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      {/* Row: logo + store/date/status + total + chevron */}
      <div className="flex min-h-0 items-center gap-3 px-4 py-3">
        {o.supplierLogo && (
          <img
            src={o.supplierLogo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{o.storeTitle}</p>
          {o.deliveryDate && (
            <p className="text-xs text-slate-500">
              {t("order_delivery_date")} {formatOrderDate(o.deliveryDate)}
            </p>
          )}
          {o.statusDescription && (
            <p className="text-xs font-medium text-slate-600">
              {o.statusDescription}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {o.totalCost != null && (
            <p className="text-sm font-semibold text-slate-900">
              {formatMoney(o.totalCost)}
            </p>
          )}
          {o.totalItems != null && (
            <p className="text-xs text-slate-500">
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
        <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          <dl className="space-y-1.5">
            {o.orderRefDate && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_ref_date")}{" "}
                </dt>
                <dd className="inline">{o.orderRefDateText}</dd>
              </div>
            )}
            {o.minOrderAmount != null && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_min_order")}{" "}
                </dt>
                <dd className="inline">{formatMoney(o.minOrderAmount)}</dd>
              </div>
            )}
            {o.remainingAmount != null && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_remaining")}{" "}
                </dt>
                <dd className="inline">{formatMoney(o.remainingAmount)}</dd>
              </div>
            )}
            {o.deliveryCost != null && (
              <div>
                <dt className="inline font-medium text-slate-500">
                  {t("order_delivery_cost")}{" "}
                </dt>
                <dd className="inline">{formatMoney(o.deliveryCost)}</dd>
              </div>
            )}
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
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("order_items")}
            </p>
            {itemsLoading ? (
              <p className="text-xs text-slate-500">
                {t("supplier_order_history_loading")}
              </p>
            ) : items.length === 0 ? (
              <p className="text-xs text-slate-500">{t("order_items_empty")}</p>
            ) : (
              <motion.ul
                className="space-y-2"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {items.map((item, idx) => (
                  <motion.li
                    key={item.productUID ?? idx}
                    variants={listItemVariants}
                    className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {item.productTitle ?? item.productOriginalTitle ?? "—"}
                      </p>
                      {(item.productPackaging || item.quantity != null) && (
                        <p className="text-xs text-slate-500">
                          {item.productPackaging}
                          {item.productPackaging && item.quantity != null
                            ? " · "
                            : ""}
                          {item.quantity != null && (
                            <>
                              {t("order_item_quantity")}: {item.quantity}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-medium text-slate-900">
                      {item.totalPrice != null
                        ? formatMoney(item.totalPrice)
                        : item.unitPrice != null
                        ? formatMoney(item.unitPrice)
                        : "—"}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
