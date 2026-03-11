"use client";

import { motion } from "framer-motion";
import { listVariants, listItemVariants } from "../../lib/motion";
import type { SupplierSection } from "@/lib/types/supplier";
import { SupplierProductCard } from "./SupplierProductCard";

type Props = {
  section: SupplierSection;
  sectionRef: (el: HTMLDivElement | null) => void;
  stickyOffset?: number;
  supplierUID?: string;
  compact?: boolean;
};

export function SupplierProductSection({
  section,
  sectionRef,
  stickyOffset = 0,
  supplierUID,
  compact = false,
}: Props) {
  return (
    <section
      ref={sectionRef}
      data-section-id={section.id}
      style={{ scrollMarginTop: stickyOffset }}
      className="space-y-1 rounded-xl border border-slate-200/70 app-bg-brand-gradient backdrop-blur-sm py-2 mt-1"
    >
      <div className="border-slate-200 pb-0 pl-3 text-base font-semibold uppercase tracking-[0.18em] text-brand-700">
        {section.label}
      </div>

      <motion.div
        className="space-y-2"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {section.products.map((product) => (
          <motion.div key={product.id} variants={listItemVariants}>
            <SupplierProductCard
              product={product}
              supplierUID={supplierUID}
              compact={compact}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
