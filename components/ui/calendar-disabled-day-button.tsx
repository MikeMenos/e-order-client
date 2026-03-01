"use client";

import React from "react";
import { useDayPicker } from "react-day-picker";

export function CalendarDisabledDayButton(
  props: React.ComponentProps<"button"> & {
    day: { date: Date };
    modifiers: { disabled?: boolean; focused?: boolean };
  },
) {
  const { day, modifiers, ...buttonProps } = props;
  const { formatters } = useDayPicker();
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const content = modifiers.disabled ? "×" : formatters.formatDay(day.date);
  return (
    <button ref={ref} type="button" {...buttonProps}>
      {content}
    </button>
  );
}
