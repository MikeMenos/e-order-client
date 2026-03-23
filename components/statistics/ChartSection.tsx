"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Props = {
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function ChartSection({ title, children, fullWidth }: Props) {
  return (
    <section className={cn("min-w-0 w-full", fullWidth && "sm:col-span-2")}>
      <Card className="flex h-full flex-col p-4">
        <h2 className="text-lg font-medium text-slate-700 shrink-0">{title}</h2>
        <div className="min-h-0 flex-1 flex flex-col">{children}</div>
      </Card>
    </section>
  );
}
