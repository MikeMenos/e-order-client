"use client";

import type { SupplierSection } from "./types";
import { SupplierProductCard } from "./SupplierProductCard";

type Props = {
  section: SupplierSection;
  sectionRef: (el: HTMLDivElement | null) => void;
};

export function SupplierProductSection({ section, sectionRef }: Props) {
  return (
    <section
      ref={sectionRef}
      data-section-id={section.id}
      className="scroll-mt-58 space-y-3"
    >
      <div className="border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {section.label}
      </div>

      <div className="space-y-2">
        {section.products.map((product) => (
          <SupplierProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
