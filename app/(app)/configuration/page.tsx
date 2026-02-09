"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { listVariants, listItemVariants } from "@/lib/motion";

const linkKeys = [
  { href: "/configuration/users", labelKey: "config_link_users" as const },
  { href: "/configuration/order-hours", labelKey: "config_link_order_hours" as const },
  { href: "/configuration/order-retake", labelKey: "config_link_order_retake" as const },
  { href: "/configuration/fav-suppliers", labelKey: "config_link_fav_suppliers" as const },
];

export default function ConfigurationIndexPage() {
  const { t } = useTranslation();

  return (
    <main className="space-y-3 text-slate-900">
      <header className="space-y-1">
        <p className="text-sm text-slate-600">
          {t("config_subtitle")}
        </p>
      </header>

      <motion.section
        className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {linkKeys.map((link) => (
          <motion.div key={link.href} variants={listItemVariants}>
            <Link
              href={link.href}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors block"
            >
              <p className="text-sm font-semibold text-slate-900">
                {t(link.labelKey)}
              </p>
              <p className="mt-1 wrap-break-word text-sm text-slate-600">
                {link.href}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </main>
  );
}
