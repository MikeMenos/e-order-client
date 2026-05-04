"use client";

import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-app-card/95 p-4 shadow-sm md:p-6">
      <h2 className="mb-3 text-lg font-semibold text-slate-800 md:mb-4 md:text-xl">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
