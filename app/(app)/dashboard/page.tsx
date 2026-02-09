"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";
import { listVariants, listItemVariants } from "@/lib/motion";
import {
  Truck,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { TileCard } from "@/components/ui/tile-card";
import { Button } from "@/components/ui/button";

const cards = [
  {
    href: "/orders-of-the-day",
    icon: ClipboardList,
    labelKey: "dashboard_card_orders_of_day",
    iconColor: "text-green-600",
  },
  {
    href: "/all-suppliers",
    icon: Truck,
    labelKey: "dashboard_card_suppliers",
    iconColor: "text-orange-500",
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
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

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
        {cards.map(({ href, icon, labelKey, iconColor }) => (
          <motion.div key={labelKey} variants={listItemVariants}>
            <TileCard
              href={href}
              icon={icon}
              label={t(labelKey)}
              iconColor={iconColor}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mx-auto mt-8 w-full max-w-xl"
        variants={listItemVariants}
        initial="hidden"
        animate="visible"
      >
        <Button
          onClick={handleLogout}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl
            border border-slate-200/80 bg-app-card/95 px-6 py-4 text-sm font-medium
            text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50
            hover:text-red-700 active:scale-[0.99]"
          aria-label={t("logout")}
        >
          <LogOut
            className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-red-600"
            aria-hidden
          />
          {t("logout")}
        </Button>
      </motion.div>
    </main>
  );
}
