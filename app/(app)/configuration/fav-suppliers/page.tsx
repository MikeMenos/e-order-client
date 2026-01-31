"use client";

import { useWishlistItems } from "../../../../hooks/useWishlist";
import { useTranslation } from "../../../../lib/i18n";

export default function FavouriteSuppliersPage() {
  const { t } = useTranslation();
  const wishlistQuery = useWishlistItems();

  const items =
    wishlistQuery.data?.items ?? wishlistQuery.data?.wishlistItems ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("config_fav_title")}
        </h1>
        <p className="text-sm text-slate-600">
          {t("config_fav_subtitle")}
        </p>
      </header>

      {wishlistQuery.isLoading && (
        <p className="text-sm text-slate-500">{t("config_loading_favorites")}</p>
      )}
      {wishlistQuery.error && (
        <p className="text-sm text-red-400">{t("config_error_favorites")}</p>
      )}

      {items.length === 0 && !wishlistQuery.isLoading ? (
        <p className="text-sm text-slate-600">{t("config_empty_favorites")}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div
              key={item.productUID ?? item.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.title}</p>
                {item.supplierTitle && (
                  <p className="truncate text-sm text-slate-600">
                    {item.supplierTitle}
                  </p>
                )}
              </div>
              {typeof item.price === "number" && (
                <p className="shrink-0 text-sm font-semibold text-slate-900">
                  {item.price.toFixed(2)} {item.currency ?? ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
