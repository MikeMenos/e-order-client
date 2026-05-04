"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { useNotificationsCountUnread } from "@/hooks/useNotifications";
import { isCountedForOrdersOfDayBadge } from "@/lib/dashboard";
import { listVariants, listItemVariants } from "@/lib/motion";
import { TileCard } from "@/components/ui/tile-card";

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
    href: "/notifications",
    iconSrc: "/assets/notifications.png",
    labelKey: "nav_notifications",
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
  const { data: unreadData } = useNotificationsCountUnread();
  const unreadNotificationsCount = unreadData?.unreadCounter ?? 0;
  const todayOrdersCount = useMemo(
    () => suppliers.filter(isCountedForOrdersOfDayBadge).length,
    [suppliers],
  );
  return (
    <main className="safe-area-insets text-slate-900 overflow-hidden px-4 pb-10 md:px-8 lg:mx-auto lg:max-w-4xl lg:pb-14">
      <div className="relative flex justify-center py-3 md:py-5">
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
            className="mx-auto md:w-[175px] md:h-auto lg:w-[188px]"
          />
        </button>
        {/* <NotificationsUnreadBanner /> */}
      </div>
      <motion.div
        className="px-2 mx-auto grid max-w-xl auto-rows-fr grid-cols-2 gap-5 md:max-w-2xl md:gap-7 lg:max-w-none lg:gap-8"
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
                  : href === "/notifications" && unreadNotificationsCount > 0
                    ? unreadNotificationsCount
                    : undefined
              }
            />
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
