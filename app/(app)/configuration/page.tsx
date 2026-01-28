"use client";

import Link from "next/link";

const links = [
  { href: "/configuration/users", label: "Users management" },
  { href: "/configuration/order-hours", label: "Order hours" },
  { href: "/configuration/order-retake", label: "Order retake" },
  { href: "/configuration/fav-suppliers", label: "Favorite suppliers" },
];

export default function ConfigurationIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Configuration</h1>
        <p className="text-sm text-slate-600">
          Settings and management screens migrated from the React Native app.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors"
          >
            <p className="text-sm font-semibold text-slate-900">{link.label}</p>
            <p className="mt-1 wrap-break-word text-xs text-slate-600">
              {link.href}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
