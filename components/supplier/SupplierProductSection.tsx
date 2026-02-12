"use client";

import { motion } from "framer-motion";
import { listVariants, listItemVariants } from "../../lib/motion";
import type { SupplierSection } from "./types";
import { SupplierProductCard } from "./SupplierProductCard";

type Props = {
  section: SupplierSection;
  sectionRef: (el: HTMLDivElement | null) => void;
  stickyOffset?: number;
  supplierUID?: string;
};

export function SupplierProductSection({
  section,
  sectionRef,
  stickyOffset = 0,
  supplierUID,
}: Props) {
  return (
    <section
      ref={sectionRef}
      data-section-id={section.id}
      style={{ scrollMarginTop: stickyOffset }}
      className="space-y-3 rounded-xl bg-app-card/95 p-2 mt-2"
    >
      <div className="border-b border-slate-200 pb-1 pl-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
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
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
