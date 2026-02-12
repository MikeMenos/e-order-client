"use client";

import { motion } from "framer-motion";
import { useBasketCounter, useBasketItems } from "../../../hooks/useBasket";
import { useTranslation } from "../../../lib/i18n";
import { listVariants, listItemVariants } from "../../../lib/motion";

export default function BasketPage() {
  const { t } = useTranslation();
  const basketQuery = useBasketItems();
  const counterQuery = useBasketCounter();

  const baskets = basketQuery.data?.basketsList ?? [];
  const totalCount = counterQuery.data?.totalBasketsCount ?? 0;

  return (
    <main className="space-y-3 text-slate-900">
      <header className="space-y-1">
        <p className="text-sm text-slate-600">{t("basket_subtitle")}</p>
        <p className="text-sm text-slate-700">
          {t("basket_total_baskets")}{" "}
          <span className="font-semibold">{totalCount}</span>
        </p>
      </header>

      {basketQuery.isLoading && (
        <p className="text-sm text-slate-500">{t("basket_loading")}</p>
      )}
      {basketQuery.error && (
        <p className="text-sm text-red-400">{t("basket_error")}</p>
      )}

      {baskets.length === 0 && !basketQuery.isLoading ? (
        <p className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">{t("basket_empty")}</p>
      ) : (
        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {baskets.map((basket: any) => (
            <motion.div
              key={basket.supplierUID}
              variants={listItemVariants}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {basket.supplierTitle}
                  </p>
                  <p className="text-sm text-slate-600">{basket.supplierUID}</p>
                </div>
                <p className="text-sm text-slate-700">
                  {t("basket_items_label")}{" "}
                  <span className="font-semibold">
                    {basket.items?.length ?? 0}
                  </span>
                </p>
              </div>
              <motion.ul
                className="max-h-40 space-y-1 overflow-auto text-sm text-slate-700"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {basket.items?.map((item: any) => (
                  <motion.li
                    key={item.productUID}
                    variants={listItemVariants}
                    className="flex justify-between gap-4"
                  >
                    <span>{item.title}</span>
                    <span className="font-mono">
                      {item.qty} {item.unit ?? ""}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
