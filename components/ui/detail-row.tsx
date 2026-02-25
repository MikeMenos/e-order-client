"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DetailRowProps = {
  label: string;
  value: ReactNode;
  /** Optional class for the value (e.g. font-semibold tabular-nums for numbers) */
  valueClassName?: string;
};

export function DetailRow({ label, value, valueClassName }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn("text-right text-slate-900", valueClassName)}>
        {value}
      </dd>
    </div>
  );
}

