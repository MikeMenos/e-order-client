"use client";

import { useBasketCounter, useBasketItems } from "../../../hooks/useBasket";
import { useTranslation } from "../../../lib/i18n";

export default function BasketPage() {
  const { t } = useTranslation();
  const basketQuery = useBasketItems();
  const counterQuery = useBasketCounter();

  const baskets = basketQuery.data?.basketsList ?? [];
  const totalCount = counterQuery.data?.totalBasketsCount ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{t("basket_title")}</h1>
        <p className="text-sm text-slate-600">
          {t("basket_subtitle")}
        </p>
        <p className="text-sm text-slate-700">
          {t("basket_total_baskets")} <span className="font-semibold">{totalCount}</span>
        </p>
      </header>

      {basketQuery.isLoading && (
        <p className="text-sm text-slate-500">{t("basket_loading")}</p>
      )}
      {basketQuery.error && (
        <p className="text-sm text-red-400">{t("basket_error")}</p>
      )}

      {baskets.length === 0 && !basketQuery.isLoading ? (
        <p className="text-sm text-slate-600">{t("basket_empty")}</p>
      ) : (
        <div className="space-y-4">
          {baskets.map((basket: any) => (
            <div
              key={basket.supplierUID}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {basket.supplierTitle}
                  </p>
                  <p className="truncate text-sm text-slate-600">
                    {basket.supplierUID}
                  </p>
                </div>
                <p className="text-sm text-slate-700">
                  {t("basket_items_label")}{" "}
                  <span className="font-semibold">
                    {basket.items?.length ?? 0}
                  </span>
                </p>
              </div>
              <ul className="max-h-40 space-y-1 overflow-auto text-sm text-slate-700">
                {basket.items?.map((item: any) => (
                  <li
                    key={item.productUID}
                    className="flex justify-between gap-4"
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="font-mono">
                      {item.qty} {item.unit ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
