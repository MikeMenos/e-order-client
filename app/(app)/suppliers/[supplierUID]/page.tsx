"use client";

import { useSearchParams, useParams } from "next/navigation";
import {
  useSupplierDisplay,
  useSupplierProducts,
} from "../../../../hooks/useSupplier";

export default function SupplierPage() {
  const params = useParams<{ supplierUID: string }>();
  const searchParams = useSearchParams();
  const supplierUID = params.supplierUID;
  const refDate = searchParams.get("refDate") ?? undefined;

  const supplierInfoQuery = useSupplierDisplay(
    supplierUID,
    refDate ?? undefined,
  );
  const productsQuery = useSupplierProducts(supplierUID, refDate ?? undefined);

  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const products = productsQuery.data?.products ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-6 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          {supplier?.title ?? "Supplier"}
        </h1>
        {supplier?.subTitle && (
          <p className="text-sm text-slate-600">{supplier.subTitle}</p>
        )}
        {refDate && (
          <p className="text-xs text-slate-700">
            For date: <span className="font-mono">{refDate}</span>
          </p>
        )}
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Products ({products.length})
        </h2>
        {productsQuery.isLoading && (
          <p className="text-xs text-slate-500">Loading products…</p>
        )}
        {productsQuery.error && (
          <p className="text-xs text-red-400">Failed to load products.</p>
        )}
        {products.length === 0 && !productsQuery.isLoading ? (
          <p className="text-sm text-slate-600">
            No products found for this supplier.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any) => (
              <div
                key={p.productUID}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-sm"
              >
                <p className="truncate text-sm font-medium text-slate-900">
                  {p.title}
                </p>
                {p.subTitle && (
                  <p className="truncate text-xs text-slate-600">
                    {p.subTitle}
                  </p>
                )}
                {typeof p.price === "number" && (
                  <p className="text-xs text-slate-700">
                    Price:{" "}
                    <span className="font-semibold">
                      {p.price.toFixed(2)} {p.currency ?? ""}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
