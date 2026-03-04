"use client";
import { useEffect, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, parseISO, isValid } from "date-fns";

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

/**
 * Extract date-only (yyyy-MM-dd) from ISO string to avoid timezone issues.
 * e.g. "2026-03-04T00:00:00-08:00" -> "2026-03-04"
 */
export function toDateOnly(iso: string | null): string | null {
  if (iso == null || iso === "") return null;
  const slice = iso.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : null;
}

/** Format an ISO date string for display (e.g. "EEE, d MMM yyyy"). Uses date-only to avoid timezone shift. */
export function formatDeliveryDateDisplay(iso: string | null): string {
  if (iso == null || iso === "") return "";
  const dateOnly = toDateOnly(iso);
  if (!dateOnly) return iso;
  try {
    return format(parse(dateOnly, "yyyy-MM-dd", new Date()), "EEE, d MMM yyyy");
  } catch {
    return iso;
  }
}

/** Parse an ISO/date string for a date picker. Uses date-only (yyyy-MM-dd) to avoid timezone issues. Falls back to today. */
export function parseDateForPicker(iso: string | null): Date {
  if (iso == null || iso === "") return new Date();
  const dateOnly = toDateOnly(iso);
  if (!dateOnly) return new Date();
  try {
    return parse(dateOnly, "yyyy-MM-dd", new Date());
  } catch {
    return new Date();
  }
}

/** Format a ref date (e.g. yyyy-MM-dd or ISO) as long display: "EEEE d MMMM". Uses date-only to avoid timezone shift. */
export function formatRefDateLong(refDate: string | null): string {
  if (refDate == null || refDate === "") return "";
  const dateOnly = toDateOnly(refDate);
  if (!dateOnly) return refDate;
  try {
    return format(parse(dateOnly, "yyyy-MM-dd", new Date()), "EEEE d MMMM");
  } catch {
    return refDate;
  }
}

/** True if refDate (yyyy-MM-dd or ISO) is the same calendar day as today. Uses date-only to avoid timezone shift. */
export function isTodayDate(refDate: string | null): boolean {
  if (refDate == null || refDate === "") return false;
  const dateOnly = toDateOnly(refDate);
  if (!dateOnly) return false;
  try {
    const ref = parse(dateOnly, "yyyy-MM-dd", new Date());
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
