"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { listVariants, listItemVariants } from "@/lib/motion";

const links = [
  { href: "/configuration/users", label: "Users management" },
  { href: "/configuration/order-hours", label: "Order hours" },
  { href: "/configuration/order-retake", label: "Order retake" },
  { href: "/configuration/fav-suppliers", label: "Favorite suppliers" },
];

export default function ConfigurationIndexPage() {
  return (
    <main className="space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Configuration</h1>
        <p className="text-sm text-slate-600">
          Settings and management screens migrated from the React Native app.
        </p>
      </header>

      <motion.section
        className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {links.map((link) => (
          <motion.div key={link.href} variants={listItemVariants}>
            <Link
              href={link.href}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors block"
            >
              <p className="text-sm font-semibold text-slate-900">
                {link.label}
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
