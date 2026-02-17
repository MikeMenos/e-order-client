"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrderView } from "@/hooks/useOrderView";
import { useTranslation } from "@/lib/i18n";
import { formatOrderDate } from "@/lib/utils";
import { DetailSection } from "@/components/ui/detail-section";
import { ChevronLeft } from "lucide-react";
import type { OrderLineItem } from "@/lib/types/order";

export default function OrderOfTheDayViewPage() {
  const { t } = useTranslation();
  const params = useParams<{ orderUID: string }>();
  const orderUID = params.orderUID;

  const orderViewQuery = useOrderView(orderUID ?? null);
  const order = orderViewQuery.data?.order;
  const items = (order?.items ?? []) as OrderLineItem[];
  const orderRecord = order as Record<string, unknown> | undefined;
  const supplierTitle =
    String(orderRecord?.supplierTitle ?? "").trim() ||
    String(orderRecord?.supplierSubtitle ?? "").trim() ||
    "";
  const displayTitle: string = supplierTitle || t("erg_order_details");
  const supplierLogo = orderRecord?.supplierLogo;
  const shopperComments = orderRecord?.shopperComments;

  return (
    <main className="pb-12 text-slate-900 px-3">
      <div className="mx-auto max-w-2xl">
        {orderViewQuery.isLoading && (
          <p className="text-base text-slate-500">
            {t("supplier_order_history_loading")}
          </p>
        )}

        {orderViewQuery.error && (
          <p className="text-base text-red-400">
            {t("supplier_order_history_error")}
          </p>
        )}

        {!orderViewQuery.isLoading && !orderViewQuery.error && order && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mt-2 justify-center">
              {supplierLogo != null && supplierLogo !== "" && (
                <img
                  src={String(supplierLogo)}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full bg-slate-100 object-contain"
                />
              )}
              <h1 className="text-xl font-bold text-slate-900 min-w-0">
                {displayTitle}
              </h1>
            </div>

            <DetailSection title={t("erg_order_details")}>
              <dl className="space-y-1 mb-1 text-base">
                {(order as Record<string, unknown>).orderRefDateText !=
                  null && (
                  <div>
                    <dt className="text-slate-500 inline">
                      {t("order_ref_date")}{" "}
                    </dt>
                    <dd className="inline text-slate-900">
                      {String(
                        (order as Record<string, unknown>).orderRefDateText,
                      )}
                    </dd>
                  </div>
                )}
                {(order as Record<string, unknown>).deliveryDateText !=
                  null && (
                  <div>
                    <dt className="text-slate-500 inline">
                      {t("order_delivery_date")}{" "}
                    </dt>
                    <dd className="inline text-slate-900">
                      {String(
                        (order as Record<string, unknown>).deliveryDateText,
                      )}
                    </dd>
                  </div>
                )}
                {(order as Record<string, unknown>).nextAvailDeliveryMessage !=
                  null && (
                  <div>
                    <dt className="text-slate-500 inline">
                      {t("order_next_delivery")}{" "}
                    </dt>
                    <dd className="inline text-slate-900">
                      {String(
                        (order as Record<string, unknown>)
                          .nextAvailDeliveryMessage,
                      )}
                    </dd>
                  </div>
                )}
                {(order as Record<string, unknown>).shopperComments != null &&
                  (order as Record<string, unknown>).shopperComments !== "" && (
                    <div>
                      <dt className="block text-slate-500 font-medium">
                        {t("order_shopper_comments")}
                      </dt>
                      <dd className="mt-0.5 rounded bg-slate-50 px-2 py-1 text-slate-700">
                        {String(
                          (order as Record<string, unknown>).shopperComments,
                        )}
                      </dd>
                    </div>
                  )}
                {shopperComments != null &&
                  String(shopperComments).trim() !== "" && (
                    <div>
                      <dt className="block text-slate-500 font-medium">
                        {t("order_supplier_comments")}
                      </dt>
                      <dd className="mt-0.5 rounded bg-slate-50 px-2 py-1 text-slate-700">
                        {String(shopperComments)}
                      </dd>
                    </div>
                  )}
              </dl>
            </DetailSection>

            <DetailSection title={t("order_items")}>
              {items.length === 0 ? (
                <p className="text-base text-slate-500 bg-white/80 rounded px-2 py-1 inline-block">
                  {t("order_items_empty")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item, idx) => {
                    const qty =
                      item.quantity ??
                      (item as Record<string, unknown>).qty ??
                      (item as Record<string, unknown>).Quantity;
                    const imageUrl =
                      item.productImage ??
                      (item as Record<string, unknown>).productImage;
                    return (
                      <li
                        key={item.productUID ?? idx}
                        className="flex items-start gap-3 rounded-md bg-slate-50 px-2 py-1.5 text-slate-700"
                      >
                        {typeof imageUrl === "string" && imageUrl !== "" ? (
                          <div className="shrink-0">
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-12 w-12 rounded border border-slate-200 bg-slate-100 object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">
                            {item.productTitle ??
                              item.productOriginalTitle ??
                              "—"}
                          </p>
                          {qty != null && qty !== "" && (
                            <>
                              {" "}
                              <span className="font-normal text-slate-500">
                                {t("checkout_quantity")}: {String(qty)}
                              </span>
                            </>
                          )}
                          {item.productPackaging && (
                            <p className="text-base text-slate-500">
                              {item.productPackaging}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </DetailSection>
          </div>
        )}

        {!orderViewQuery.isLoading &&
          !orderViewQuery.error &&
          !order &&
          orderUID && (
            <p className="text-base text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
              {t("supplier_order_history_empty")}
            </p>
          )}
      </div>
    </main>
  );
}
