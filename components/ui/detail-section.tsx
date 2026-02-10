"use client";

import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-app-card/95 p-3 shadow-sm">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

