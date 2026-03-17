"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { isCountedForOrdersOfDayBadge } from "@/lib/dashboard";
import { listVariants, listItemVariants } from "@/lib/motion";
import { TileCard } from "@/components/ui/tile-card";
import { NotificationsUnreadBanner } from "@/components/dashboard/NotificationsUnreadBanner";

const cards = [
  {
    href: "/all-suppliers",
    iconSrc: "/assets/suppliers.png",
    labelKey: "dashboard_card_suppliers",
  },
  {
    href: "/orders-of-the-day",
    iconSrc: "/assets/orders-of-the-day.png",
    labelKey: "dashboard_card_orders_of_day",
  },

  {
    href: "/statistics",
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
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { suppliers } = useSuppliersListForToday();
  const todayOrdersCount = useMemo(
    () => suppliers.filter(isCountedForOrdersOfDayBadge).length,
    [suppliers],
  );
  return (
    <main className="text-slate-900 overflow-hidden px-2">
      <div className="relative flex justify-center py-2">
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label={t("logout")}
        >
          <Image
            src="/icon0.svg"
            alt="E-Order Logo"
            width={150}
            height={150}
            priority
          />
        </button>
        {/* <NotificationsUnreadBanner /> */}
      </div>
      <motion.div
        className="mx-auto grid grid-cols-2 auto-rows-fr gap-4 max-w-xl"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map(({ href, iconSrc, labelKey }) => (
          <motion.div key={labelKey} variants={listItemVariants}>
            <TileCard
              href={href}
              iconSrc={iconSrc}
              label={t(labelKey)}
              badgeNum={
                href === "/orders-of-the-day" && todayOrdersCount > 0
                  ? todayOrdersCount
                  : undefined
              }
            />
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
