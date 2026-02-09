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
    <div className={className}>
      <DayPicker showOutsideDays={showOutsideDays} {...props} />
    </div>
  );
}
