"use client";
import { useEffect, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @param remountTrigger - When this changes, the effect re-runs to pick up newly mounted elements (e.g. pathname for conditional render).
 */
export function useMeasuredHeight<T extends HTMLElement>(
  remountTrigger?: unknown,
) {
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
  }, [remountTrigger]);

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

/** Deliverable: dayIsClosed false, supplierCanDeliver true */
function isDeliverable(item: {
  dayIsClosed?: boolean;
  supplierCanDeliver?: boolean;
}): boolean {
  return !item.dayIsClosed && !!item.supplierCanDeliver;
}

/** Processable: deliverable + supplierCanProcessOrder true */
function isProcessable(item: {
  dayIsClosed?: boolean;
  supplierCanDeliver?: boolean;
  supplierCanProcessOrder?: boolean;
}): boolean {
  return isDeliverable(item) && !!item.supplierCanProcessOrder;
}

/** Check if refDate (yyyy-MM-dd) exists as dateObj in weekDailyAnalysis */
export function refDateInWeekDailyAnalysis(
  refDate: string | null,
  weekDailyAnalysis: Array<{ dateObj?: string }>,
): boolean {
  const key = toDateOnly(refDate);
  if (!key) return false;
  return weekDailyAnalysis.some(
    (it) => toDateOnly(it.dateObj ?? null) === key,
  );
}

/** Default when NO refDate: today only if processable; else next deliverable. */
export function getDefaultDeliveryDateNoRefDate(
  weekDailyAnalysis: Array<{
    dateObj?: string;
    dayIsClosed?: boolean;
    supplierCanDeliver?: boolean;
    supplierCanProcessOrder?: boolean;
  }>,
  todayDate: string | null,
): string | null {
  if (!todayDate?.trim() || weekDailyAnalysis.length === 0) return todayDate;
  const key = toDateOnly(todayDate);
  if (!key) return todayDate;

  const sorted = [...weekDailyAnalysis]
    .map((it) => ({ ...it, dateOnly: toDateOnly(it.dateObj ?? null) }))
    .filter((it) => it.dateOnly)
    .sort((a, b) =>
      (a.dateOnly as string).localeCompare(b.dateOnly as string),
    );

  const todayItem = sorted.find((it) => (it.dateOnly as string) === key);
  if (todayItem && isProcessable(todayItem)) {
    return todayItem.dateObj?.slice(0, 10) ?? todayDate;
  }
  const nextDeliverable = sorted.find((it) => isDeliverable(it));
  return nextDeliverable?.dateObj?.slice(0, 10) ?? todayDate;
}

/** Default when refDate present: refDate if matched and processable; else next deliverable after refDate. */
export function getDefaultDeliveryDateWithRefDate(
  refDate: string | null,
  weekDailyAnalysis: Array<{
    dateObj?: string;
    dayIsClosed?: boolean;
    supplierCanDeliver?: boolean;
    supplierCanProcessOrder?: boolean;
  }>,
): string | null {
  if (!refDate?.trim() || weekDailyAnalysis.length === 0) return null;
  const key = toDateOnly(refDate);
  if (!key) return null;

  const sorted = [...weekDailyAnalysis]
    .map((it) => ({ ...it, dateOnly: toDateOnly(it.dateObj ?? null) }))
    .filter((it) => it.dateOnly)
    .sort((a, b) =>
      (a.dateOnly as string).localeCompare(b.dateOnly as string),
    );

  const matchedItem = sorted.find((it) => (it.dateOnly as string) === key);
  if (matchedItem && isProcessable(matchedItem)) {
    return matchedItem.dateObj?.slice(0, 10) ?? key;
  }
  const fromIdx = sorted.findIndex((it) => (it.dateOnly as string) >= key);
  const afterRef = fromIdx >= 0 ? sorted.slice(fromIdx) : sorted;
  const nextDeliverable = afterRef.find((it) => isDeliverable(it));
  return nextDeliverable?.dateObj?.slice(0, 10) ?? null;
}

/** Find effective delivery date from preferred: use preferred if valid, else next available matching criteria. */
export function getEffectiveDeliveryDateFromPreferred(
  preferredDate: string | null,
  weekDailyAnalysis: Array<{
    dateObj?: string;
    dayIsClosed?: boolean;
    supplierCanDeliver?: boolean;
    supplierCanProcessOrder?: boolean;
  }>,
  fallback: string | null,
): string | null {
  if (!preferredDate?.trim() || weekDailyAnalysis.length === 0)
    return fallback;
  const key = toDateOnly(preferredDate);
  if (!key) return fallback;

  const sorted = [...weekDailyAnalysis]
    .map((it) => ({ ...it, dateOnly: toDateOnly(it.dateObj ?? null) }))
    .filter((it) => it.dateOnly)
    .sort((a, b) =>
      (a.dateOnly as string).localeCompare(b.dateOnly as string),
    );

  const fromIdx = sorted.findIndex((it) => (it.dateOnly as string) >= key);
  const toCheck = fromIdx >= 0 ? sorted.slice(fromIdx) : [];

  const valid = toCheck.find((it) => isProcessable(it));
  if (valid?.dateObj) return valid.dateObj.slice(0, 10);
  const firstValid = sorted.find((it) => isProcessable(it));
  return firstValid?.dateObj?.slice(0, 10) ?? fallback;
}

/** Find the effective ref date when user selects a date: use selected if valid (!dayIsClosed && supplierCanDeliver), else next available in weekDailyAnalysis. */
export function getEffectiveRefDateFromSelection(
  selectedDate: string | null,
  weekDailyAnalysis: Array<{
    dateObj?: string;
    dayIsClosed?: boolean;
    supplierCanDeliver?: boolean;
  }>,
): string | null {
  if (!selectedDate?.trim() || weekDailyAnalysis.length === 0) return selectedDate;
  const key = toDateOnly(selectedDate);
  if (!key) return selectedDate;

  const sorted = [...weekDailyAnalysis]
    .map((it) => ({ ...it, dateOnly: toDateOnly(it.dateObj ?? null) }))
    .filter((it) => it.dateOnly)
    .sort((a, b) =>
      (a.dateOnly as string).localeCompare(b.dateOnly as string),
    );

  const fromIdx = sorted.findIndex((it) => (it.dateOnly as string) >= key);
  const toCheck = fromIdx >= 0 ? sorted.slice(fromIdx) : [];

  const valid = toCheck.find(
    (it) => !it.dayIsClosed && it.supplierCanDeliver,
  );
  if (valid?.dateObj) {
    const d = valid.dateObj.slice(0, 10);
    return d ? `${d}T12:00:00.000Z` : selectedDate;
  }
  return selectedDate;
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
