"use client";

import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}

