"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { listVariants, listItemVariants } from "@/lib/motion";
import { Truck, ClipboardList, BarChart3, Settings } from "lucide-react";

const cards = [
  {
    href: "/all-suppliers",
    icon: Truck,
    labelKey: "dashboard_card_suppliers",
    iconColor: "text-orange-500",
  },
  {
    href: "/orders-of-the-day",
    icon: ClipboardList,
    labelKey: "dashboard_card_orders_of_day",
    iconColor: "text-green-600",
  },
  {
    href: "#",
    icon: BarChart3,
    labelKey: "dashboard_card_statistics",
    iconColor: "text-blue-600",
  },
  {
    href: "/settings",
    icon: Settings,
    labelKey: "dashboard_card_settings",
    iconColor: "text-slate-700",
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
        className="mx-auto grid w-full max-w-none grid-cols-2 auto-rows-fr gap-4 px-4 sm:max-w-2xl"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >

        {cards.map(({ href, icon: Icon, labelKey, iconColor }) => (
          <motion.div key={labelKey} variants={listItemVariants} >
            <Link
              href={href}
              className="flex h-full w-full flex-col items-center justify-center
              gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md"
            >
              <Icon className={`h-12 w-12 shrink-0 ${iconColor}`} aria-hidden />
              <span className="text-center text-sm font-medium text-slate-900">
                {t(labelKey)}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
