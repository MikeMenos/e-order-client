"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { listVariants, listItemVariants } from "@/lib/motion";
import { TileCard } from "@/components/ui/tile-card";

const cards = [
  {
    href: "/orders-of-the-day",
    iconSrc: "/assets/orders-of-the-day.png",
    labelKey: "dashboard_card_orders_of_day",
  },
  {
    href: "/all-suppliers",
    iconSrc: "/assets/suppliers.png",
    labelKey: "dashboard_card_suppliers",
  },
  {
    href: "#",
    iconSrc: "/assets/statistics.png",
    labelKey: "dashboard_card_statistics",
  },
  {
    href: "/settings",
    iconSrc: "/assets/settings.png",
    labelKey: "dashboard_card_settings",
  },
] as const;

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <main className="text-slate-900">
      <div className="flex justify-center py-6">
        <Image
          src="/icon0.svg"
          alt="E-Order Logo"
          width={120}
          height={120}
          priority
        />
      </div>
      <motion.div
        className="mx-auto grid grid-cols-2 auto-rows-fr gap-4 max-w-xl"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map(({ href, iconSrc, labelKey }) => (
          <motion.div key={labelKey} variants={listItemVariants}>
            <TileCard href={href} iconSrc={iconSrc} label={t(labelKey)} />
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
