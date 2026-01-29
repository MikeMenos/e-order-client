"use client";

import { Button } from "../ui/button";
import type { SupplierProduct } from "./types";

type Props = {
  product: SupplierProduct;
};

export function SupplierProductCard({ product }: Props) {
  const { id, title, subTitle, image, qty } = product;

  return (
    <article
      key={id}
      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="h-10 w-10 shrink-0 rounded bg-slate-50 object-contain"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        {subTitle && (
          <p className="truncate text-xs text-slate-500">{subTitle}</p>
        )}
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="shrink-0">Reserve:</span>
          <div className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-xs"
              aria-label="Decrease quantity"
            >
              -
            </Button>
            <span className="min-w-5 text-center">0</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-xs"
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-slate-900">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-xs"
          aria-label="Decrease reserved quantity"
        >
          -
        </Button>
        <span className="min-w-5 text-center">{qty ?? 0}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-xs"
          aria-label="Increase reserved quantity"
        >
          +
        </Button>
      </div>
    </article>
  );
}
