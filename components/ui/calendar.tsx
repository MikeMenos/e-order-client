"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";

import "react-day-picker/src/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn(
        "rdp-root rounded-lg border border-slate-200 p-3 [--rdp-accent-color:var(--color-brand-500)] [--rdp-accent-background-color:var(--color-brand-100)] [--rdp-today-color:var(--color-brand-600)]",
        className
      )}
    >
      <DayPicker showOutsideDays={showOutsideDays} {...props} />
    </div>
  );
}
