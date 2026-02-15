import { useEffect, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      setHeight(Math.ceil(el.getBoundingClientRect().height));
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const onLoad = () => measure();
    window.addEventListener("load", onLoad);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return { ref, height };
}

export function formatOrderDate(value: unknown): string {
  if (value == null) return "";
  const date =
    typeof value === "string"
      ? parseISO(value)
      : value instanceof Date
      ? value
      : new Date(Number(value));
  if (!isValid(date))
    return typeof value === "string" ? value.slice(0, 10) : String(value);
  return format(date, "dd-MM-yyyy");
}

export function formatMoney(value: unknown): string {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `${n.toFixed(2)} €`;
}

/** Format an ISO date string for display (e.g. "EEE, d MMM yyyy"). Returns raw string or empty on parse failure. */
export function formatDeliveryDateDisplay(iso: string | null): string {
  if (iso == null || iso === "") return "";
  try {
    return format(parseISO(iso), "EEE, d MMM yyyy");
  } catch {
    return iso;
  }
}

/** Parse an ISO date for a date picker initial value. Falls back to today. */
export function parseDateForPicker(iso: string | null): Date {
  if (iso == null || iso === "") return new Date();
  try {
    return parseISO(iso);
  } catch {
    return new Date();
  }
}

/** Format a ref date (e.g. yyyy-MM-dd) as long display: "EEEE d MMMM" (e.g. Monday 3 February). */
export function formatRefDateLong(refDate: string | null): string {
  if (refDate == null || refDate === "") return "";
  try {
    return format(parseISO(refDate), "EEEE d MMMM");
  } catch {
    return refDate;
  }
}

/** True if refDate (yyyy-MM-dd or ISO) is the same calendar day as today. */
export function isTodayDate(refDate: string | null): boolean {
  if (refDate == null || refDate === "") return false;
  try {
    const ref = parseISO(refDate);
    const today = new Date();
    return (
      ref.getFullYear() === today.getFullYear() &&
      ref.getMonth() === today.getMonth() &&
      ref.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}
