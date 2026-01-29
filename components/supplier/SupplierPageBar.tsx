"use client";

import { Button } from "../ui/button";

type SupplierInfo = {
  logo?: string | null;
  title?: string | null;
};

type Props = {
  supplier: SupplierInfo | null;
  selectedDate: string | null;
  onBack: () => void;
};

export function SupplierPageBar({ supplier, selectedDate, onBack }: Props) {
  return (
    <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onBack}
        className="h-8 w-8 shrink-0 text-sm"
        aria-label="Back"
      >
        ←
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        {supplier?.logo && (
          <img
            src={supplier.logo}
            alt={supplier.title ?? "Supplier"}
            className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
          />
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="truncate text-sm font-semibold text-slate-900"
            title={supplier?.title ?? "Supplier"}
          >
            {supplier?.title ?? "Supplier"}
          </p>
        </div>
      </div>

      <div className="w-fit shrink-0 rounded-lg bg-brand-500 px-4 py-1 text-sm font-semibold text-white">
        <span>{selectedDate}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
          i
        </span>
      </div>
    </div>
  );
}
